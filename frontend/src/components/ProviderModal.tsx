import { useEffect, useState } from "react";
import { Modal } from "antd";
import type {
  CreateProviderRequest,
  OpenRouterModel,
  OpenRouterModelsResponse,
  ProviderDto,
  ProviderType
} from "@shared/types/providers";
import ProviderForm from "./providers/ProviderForm";
import ProviderList from "./providers/ProviderList";

type ProviderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProvidersChange?: () => void;
};

function ProviderModal({ isOpen, onClose, onProvidersChange }: ProviderModalProps) {
  const [providers, setProviders] = useState<ProviderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const providerType: ProviderType = "openrouter";
  const [name, setName] = useState("");
  const [model, setModel] = useState("openai/gpt-5.2");
  const [apiKey, setApiKey] = useState("");
  const modelListId = "openrouter-models";

  useEffect(() => {
    if (!isOpen) return;
    void loadProviders();
  }, [isOpen]);

  useEffect(() => {
    setOpenRouterModels([]);
    setModelError(null);
    setTestMessage(null);
  }, []);

  async function loadProviders() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/providers");
      if (!res.ok) {
        throw new Error(`Failed to load providers (${res.status})`);
      }
      const data = (await res.json()) as ProviderDto[];
      setProviders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load providers");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setTestMessage(null);
    const body: CreateProviderRequest = {
      provider_type: providerType,
      name: name.trim(),
      model: model.trim(),
      apiKey: apiKey.trim()
    };
    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `Failed to save provider (${res.status})`);
      }
      setName("");
      setApiKey("");
      await loadProviders();
      onProvidersChange?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save provider");
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/providers/${id}/activate`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `Failed to activate (${res.status})`);
      }
      await loadProviders();
      onProvidersChange?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to activate provider");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/providers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `Failed to delete (${res.status})`);
      }
      await loadProviders();
      onProvidersChange?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete provider");
    }
  }

  async function handleTest() {
    setTesting(true);
    setError(null);
    setTestMessage(null);
    if (!model.trim() || !apiKey.trim()) {
      setError("Model and API key are required to test.");
      setTesting(false);
      return;
    }
    try {
      const res = await fetch("/api/providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_type: providerType,
          model: model.trim(),
          apiKey: apiKey.trim()
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `Test failed (${res.status})`);
      }
      const data = (await res.json()) as { message: string };
      setTestMessage(data.message || "OK");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTesting(false);
    }
  }

  async function handleLoadModels() {
    setModelsLoading(true);
    setModelError(null);
    if (!apiKey.trim()) {
      setModelError("API key is required to load models.");
      setModelsLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/providers/openrouter/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `Failed to load models (${res.status})`);
      }
      const data = (await res.json()) as OpenRouterModelsResponse;
      setOpenRouterModels(data.data);
    } catch (err: unknown) {
      setModelError(err instanceof Error ? err.message : "Failed to load models");
    } finally {
      setModelsLoading(false);
    }
  }

  if (!isOpen) return null;

  const showNoActiveWarning = !loading && providers.length > 0 && !providers.some((provider) => provider.is_active);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title="AI Settings"
      className="provider-modal"
      width={820}
      destroyOnClose
    >
      <div className="provider-modal__layout">
        <ProviderForm
          name={name}
          model={model}
          apiKey={apiKey}
          openRouterModels={openRouterModels}
          modelsLoading={modelsLoading}
          modelError={modelError}
          testMessage={testMessage}
          error={error}
          saving={saving}
          testing={testing}
          modelListId={modelListId}
          onNameChange={setName}
          onModelChange={setModel}
          onApiKeyChange={setApiKey}
          onLoadModels={handleLoadModels}
          onTest={handleTest}
          onSubmit={handleCreate}
        />
        <ProviderList
          providers={providers}
          loading={loading}
          showNoActiveWarning={showNoActiveWarning}
          onActivate={handleActivate}
          onDelete={handleDelete}
        />
      </div>
    </Modal>
  );
}

export default ProviderModal;
