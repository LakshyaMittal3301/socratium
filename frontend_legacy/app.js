const state = {
  bookId: null,
  sections: [],
  currentSection: null,
  currentPage: 1,
  pendingQuestion: null,
  pendingQuestionType: null,
  lastAnswer: null,
  mode: "auto"
};

const elements = {
  pdfFrame: document.getElementById("pdfFrame"),
  pageInput: document.getElementById("pageInput"),
  setPageBtn: document.getElementById("setPageBtn"),
  sectionInfo: document.getElementById("sectionInfo"),
  chatLog: document.getElementById("chatLog"),
  chatText: document.getElementById("chatText"),
  chatForm: document.getElementById("chatForm"),
  chatSubtitle: document.getElementById("chatSubtitle"),
  introBtn: document.getElementById("introBtn"),
  practiceBtn: document.getElementById("practiceBtn"),
  doneBtn: document.getElementById("doneBtn"),
  modePill: document.getElementById("modePill"),
  toggleModeBtn: document.getElementById("toggleModeBtn"),
  providerBtn: document.getElementById("providerBtn"),
  uploadBtn: document.getElementById("uploadBtn"),
  providerDialog: document.getElementById("providerDialog"),
  providerForm: document.getElementById("providerForm"),
  providerName: document.getElementById("providerName"),
  providerType: document.getElementById("providerType"),
  providerBaseUrl: document.getElementById("providerBaseUrl"),
  providerApiKey: document.getElementById("providerApiKey"),
  providerModel: document.getElementById("providerModel"),
  providerStatus: document.getElementById("providerStatus"),
  providerTestBtn: document.getElementById("providerTestBtn"),
  uploadDialog: document.getElementById("uploadDialog"),
  uploadForm: document.getElementById("uploadForm"),
  uploadFile: document.getElementById("uploadFile"),
  uploadStatus: document.getElementById("uploadStatus")
};

async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  elements.chatLog.appendChild(div);
  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function setMode(mode) {
  state.mode = mode;
  const label = mode === "auto" ? "Auto" : mode === "ask" ? "Ask" : "Answer";
  elements.modePill.textContent = `Mode: ${label}`;
}

function cycleMode() {
  if (state.mode === "auto") setMode("ask");
  else if (state.mode === "ask") setMode("answer");
  else setMode("auto");
}

function updateSectionUI() {
  if (!state.currentSection) {
    elements.sectionInfo.textContent = "No section loaded";
    elements.chatSubtitle.textContent = "Select a page to start.";
    return;
  }
  const { title, start_page, end_page } = state.currentSection;
  elements.sectionInfo.textContent = `${title} (pp. ${start_page}-${end_page})`;
  elements.chatSubtitle.textContent = `Section: ${title}`;
}

function updatePdfFrame() {
  if (!state.bookId) return;
  elements.pdfFrame.src = `/api/books/${state.bookId}/pdf#page=${state.currentPage}`;
}

async function setCurrentPage(page) {
  if (!state.bookId) return;
  state.currentPage = page;
  elements.pageInput.value = page;
  updatePdfFrame();

  const section = await apiGet(`/api/books/${state.bookId}/pages/${page}/section`);
  state.currentSection = section;
  updateSectionUI();

  await apiPost(`/api/reading/${state.bookId}`, {
    currentPage: page,
    currentSectionId: section.id
  });
}

async function loadBook() {
  const books = await apiGet("/api/books");
  if (!books.length) {
    elements.chatSubtitle.textContent = "No book found. Upload a PDF.";
    return;
  }

  state.bookId = books[0].id;
  state.sections = await apiGet(`/api/books/${state.bookId}/sections`);

  const reading = await apiGet(`/api/reading/${state.bookId}`);
  const currentPage = reading.currentPage || 1;
  await setCurrentPage(currentPage);
}

async function handleIntro() {
  if (!state.currentSection || !state.bookId) {
    appendMessage("assistant", "Pick a page first so I know the section.");
    return;
  }

  appendMessage("assistant", "Generating intro prompt...");
  const response = await apiPost("/api/chat/intro", {
    bookId: state.bookId,
    sectionId: state.currentSection.id
  });
  appendMessage("assistant", response.message);
  state.pendingQuestion = response.message;
  state.pendingQuestionType = "intro";
}

async function handlePractice() {
  if (!state.currentSection || !state.bookId) {
    appendMessage("assistant", "Pick a page first so I know the section.");
    return;
  }

  appendMessage("assistant", "Generating practice questions...");
  const response = await apiPost("/api/chat/practice", {
    bookId: state.bookId,
    sectionId: state.currentSection.id
  });
  appendMessage("assistant", response.message);
  state.pendingQuestion = response.message;
  state.pendingQuestionType = "practice";
}

async function handleSend(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  elements.chatText.value = "";

  const shouldAnswer =
    state.mode === "answer" ||
    (state.mode === "auto" && state.pendingQuestion);

  if (trimmed.toLowerCase() === "done" || trimmed.toLowerCase() === "final") {
    await handleDone();
    return;
  }

  if (shouldAnswer && state.pendingQuestion) {
    appendMessage("user", trimmed);
    state.lastAnswer = trimmed;
    await apiPost("/api/chat/answer", {
      sectionId: state.currentSection.id,
      question: state.pendingQuestion,
      answer: trimmed,
      isComplete: false
    });
    appendMessage("assistant", "Answer saved. Click Done when complete.");
    return;
  }

  if (!state.currentSection || !state.bookId) {
    appendMessage("assistant", "Pick a page first so I know the context.");
    return;
  }

  appendMessage("user", trimmed);
  const response = await apiPost("/api/chat/adhoc", {
    bookId: state.bookId,
    sectionId: state.currentSection.id,
    question: trimmed
  });
  appendMessage("assistant", response.message);
}

async function handleDone() {
  if (!state.pendingQuestion || !state.lastAnswer) {
    appendMessage("assistant", "No active prompt to complete.");
    return;
  }

  await apiPost("/api/chat/answer", {
    sectionId: state.currentSection.id,
    question: state.pendingQuestion,
    answer: state.lastAnswer,
    isComplete: true
  });
  appendMessage("assistant", "Got it. Ready for the next section?");
  state.pendingQuestion = null;
  state.pendingQuestionType = null;
  state.lastAnswer = null;
}

async function loadProviderStatus() {
  try {
    const provider = await apiGet("/api/provider");
    if (provider.configured) {
      elements.providerName.value = provider.name || "";
      elements.providerType.value = provider.providerType || "openai";
      elements.providerBaseUrl.value = provider.baseUrl || "";
      elements.providerModel.value = provider.model || "";
      elements.providerStatus.textContent = provider.hasKey
        ? "Provider configured."
        : "Provider saved (no API key).";
    } else {
      elements.providerType.value = "openai";
      elements.providerStatus.textContent = "No provider configured yet.";
    }

    elements.providerType.dispatchEvent(new Event("change"));
  } catch (error) {
    elements.providerStatus.textContent = error.message;
  }
}

async function handleProviderSave(event) {
  event.preventDefault();
  try {
    await apiPost("/api/provider", {
      name: elements.providerName.value,
      providerType: elements.providerType.value,
      baseUrl: elements.providerBaseUrl.value.trim(),
      apiKey: elements.providerApiKey.value,
      model: elements.providerModel.value.trim()
    });
    elements.providerStatus.textContent = "Provider saved.";
    elements.providerDialog.close();
  } catch (error) {
    elements.providerStatus.textContent = error.message;
  }
}

async function handleProviderTest() {
  elements.providerStatus.textContent = "Testing...";
  try {
    const result = await apiPost("/api/provider/test", {});
    elements.providerStatus.textContent = `Success: ${result.message}`;
  } catch (error) {
    elements.providerStatus.textContent = error.message;
  }
}

async function handleUpload(event) {
  event.preventDefault();
  if (!elements.uploadFile.files.length) {
    elements.uploadStatus.textContent = "Pick a PDF to upload.";
    return;
  }

  const formData = new FormData();
  formData.append("file", elements.uploadFile.files[0]);

  elements.uploadStatus.textContent = "Uploading and processing...";
  const res = await fetch("/api/books/upload", {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    elements.uploadStatus.textContent = data?.error?.message || "Upload failed.";
    return;
  }

  const data = await res.json();
  elements.uploadStatus.textContent = "Upload complete.";
  elements.uploadDialog.close();
  state.bookId = data.id;
  state.sections = await apiGet(`/api/books/${state.bookId}/sections`);
  await setCurrentPage(1);
}

function attachEvents() {
  elements.setPageBtn.addEventListener("click", async () => {
    const page = Number(elements.pageInput.value || 1);
    await setCurrentPage(page);
  });

  elements.introBtn.addEventListener("click", handleIntro);
  elements.practiceBtn.addEventListener("click", handlePractice);

  elements.chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleSend(elements.chatText.value);
  });

  elements.doneBtn.addEventListener("click", handleDone);
  elements.toggleModeBtn.addEventListener("click", cycleMode);

  elements.providerBtn.addEventListener("click", () => {
    elements.providerDialog.showModal();
  });

  elements.uploadBtn.addEventListener("click", () => {
    elements.uploadDialog.showModal();
  });

  elements.providerForm.addEventListener("submit", handleProviderSave);
  elements.providerTestBtn.addEventListener("click", handleProviderTest);
  elements.uploadForm.addEventListener("submit", handleUpload);

  elements.providerType.addEventListener("change", () => {
    if (elements.providerType.value === "gemini") {
      if (!elements.providerBaseUrl.value.trim()) {
        elements.providerBaseUrl.placeholder = "https://generativelanguage.googleapis.com/v1beta";
      }
      if (!elements.providerModel.value.trim()) {
        elements.providerModel.placeholder = "gemini-3-flash-preview";
      }
      return;
    }

    if (!elements.providerBaseUrl.value.trim()) {
      elements.providerBaseUrl.placeholder = "https://api.openai.com";
    }
    if (!elements.providerModel.value.trim()) {
      elements.providerModel.placeholder = "gpt-4o-mini";
    }
  });
}

async function init() {
  attachEvents();
  setMode("auto");
  await loadProviderStatus();
  await loadBook();
}

init().catch((error) => {
  appendMessage("assistant", error.message || "Failed to start");
});
