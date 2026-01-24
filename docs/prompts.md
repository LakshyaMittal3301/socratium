# Codex Prompt Pack (Socratium)

Use these as quick copy/paste prompts in Codex CLI.  
Assumes AGENTS.md workflow + PRD/Spec templates.

---

## 0) Start a new slice or feature
**Prompt**
New work item: <one sentence>. Use the AGENTS.md workflow.

---

## 1) PRD (DRAFT)
**Prompt**
PRD draft: Interview me (≤8 questions). Then create/update `docs/prd/<name>.md` using `docs/prd/TEMPLATE.md`. Mark it **DRAFT**. Do not implement code.

---

## 2) PRD → FINAL (after I review)
**Prompt**
Revise the PRD based on my feedback. Keep it minimal. Mark it **FINAL** when done.

---

## 3) Spec (DRAFT)
**Prompt**
Spec draft: Using PRD (FINAL), create/update `docs/spec/<name>.md` using `docs/spec/TEMPLATE.md`. Include a small checklist of slices. Mark it **DRAFT**. Do not implement code.

---

## 4) Spec → FINAL (after I review)
**Prompt**
Revise the Spec based on my feedback. Keep the checklist slices small. Mark it **FINAL** when done.

---

## 5) Build one slice
**Prompt**
Build slice: Implement checklist item: "<paste exact checkbox text>". Only this slice. Keep diff small. Stop when done.

---

## 6) AI Review (tiny summary)
Run `/review`, then:

**Prompt**
Summarize review in max 5 bullets: P0/P1/P2 + file + one-line fix. No essays. No new features.

---

## 7) AI Fix (P0/P1 only)
**Prompt**
Fix: Apply only the P0/P1 items from the latest review summary. No new features. Local refactors allowed only if required for clarity/correctness in this slice.

---

## 8) Re-review (optional)
Run `/review`, then:

**Prompt**
Confirm previous P0/P1 items are resolved. If any remain, list only remaining P0/P1 (max 3 bullets).

---

## 9) Human review cue
**Prompt**
Show me what changed and why (brief). Then I will review `/diff`.
