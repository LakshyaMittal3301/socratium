import { useEffect, useState } from "react";
import { Alert, Button, Input, Modal, Select, Space, Tag, Typography } from "antd";
import type {
  CreateProviderRequest,
  OpenRouterModel,
  OpenRouterModelsResponse,
  ProviderDto,
  ProviderType
} from "@shared/types/providers";

type ProviderModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function ProviderModal({ isOpen, onClose }: ProviderModalProps) {
  const [providers, setProviders] = useState<ProviderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [providerType, setProviderType] = useState<ProviderType>("gemini");
  const [name, setName] = useState("");
  const [model, setModel] = useState("gemini-3-flash-preview");
  const [apiKey, setApiKey] = useState("");
  const modelListId = "openrouter-models";

  const defaultModelByType: Record<ProviderType, string> = {
    gemini: "gemini-3-flash-preview",
    openrouter: "openai/gpt-5.2"
  };

  useEffect(() => {
    if (!isOpen) return;
    void loadProviders();
  }, [isOpen]);

  useEffect(() => {
    setModel(defaultModelByType[providerType]);
    setOpenRouterModels([]);
    setModelError(null);
    setTestMessage(null);
  }, [providerType]);

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
      setOpenRouterModels(data.models);
    } catch (err: unknown) {
      setModelError(err instanceof Error ? err.message : "Failed to load models");
    } finally {
      setModelsLoading(false);
    }
  }

  if (!isOpen) return null;

  const hasActiveProvider = providers.some((provider) => provider.is_active);

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
        <section className="provider-modal__section">
          <Typography.Title level={5} className="provider-modal__title">
            Add provider
          </Typography.Title>
          <Typography.Text type="secondary" className="provider-modal__subtitle">
            Add your provider and store the API key locally.
          </Typography.Text>
          <form onSubmit={handleCreate} className="provider-modal__form">
            <div className="provider-modal__field">
              <Typography.Text strong>Provider</Typography.Text>
              <Select
                value={providerType}
                onChange={(value) => setProviderType(value as ProviderType)}
                options={[
                  { value: "gemini", label: "Gemini" },
                  { value: "openrouter", label: "OpenRouter" }
                ]}
                size="middle"
              />
            </div>
            <div className="provider-modal__field">
              <Typography.Text strong>Name</Typography.Text>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={providerType === "openrouter" ? "My OpenRouter" : "My Gemini"}
                size="middle"
              />
            </div>
            <div className="provider-modal__field">
              <Typography.Text strong>Model</Typography.Text>
              {providerType === "openrouter" ? (
                <Space className="provider-modal__row" align="start">
                  <Input
                    list={modelListId}
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    placeholder="openai/gpt-5.2"
                    size="middle"
                  />
                  <Button size="middle" onClick={handleLoadModels} loading={modelsLoading}>
                    Load models
                  </Button>
                </Space>
              ) : (
                <Input value={model} onChange={(event) => setModel(event.target.value)} size="middle" />
              )}
              {providerType === "openrouter" && openRouterModels.length > 0 && (
                <datalist id={modelListId}>
                  {openRouterModels.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name ?? item.id}
                    </option>
                  ))}
                </datalist>
              )}
              {providerType === "openrouter" && (
                <Typography.Text type="secondary" className="provider-modal__note">
                  {openRouterModels.length > 0
                    ? `${openRouterModels.length} models loaded.`
                    : "Load models to browse the OpenRouter catalog."}
                </Typography.Text>
              )}
              {modelError && (
                <Typography.Text type="danger" className="provider-modal__note">
                  {modelError}
                </Typography.Text>
              )}
            </div>
            <div className="provider-modal__field">
              <Typography.Text strong>API key</Typography.Text>
              <Input.Password
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder={
                  providerType === "openrouter"
                    ? "Paste your OpenRouter API key"
                    : "Paste your Gemini API key"
                }
                size="middle"
              />
            </div>
            {testMessage && (
              <Alert
                type="success"
                showIcon
                message={`Test success: ${testMessage}`}
                className="provider-modal__alert"
              />
            )}
            {error && (
              <Alert type="error" showIcon message={error} className="provider-modal__alert" />
            )}
            <div className="provider-modal__actions">
              <Space>
                <Button size="middle" onClick={handleTest} loading={testing}>
                  Test key
                </Button>
                <Button size="middle" type="primary" htmlType="submit" loading={saving}>
                  Save provider
                </Button>
              </Space>
            </div>
          </form>
        </section>

        <section className="provider-modal__section">
          <Typography.Title level={5} className="provider-modal__title">
            Providers
          </Typography.Title>
          <Typography.Text type="secondary" className="provider-modal__subtitle">
            Choose the active model for new chats.
          </Typography.Text>
          {!loading && providers.length > 0 && !hasActiveProvider && (
            <Alert
              type="warning"
              showIcon
              message="No active provider selected. Activate one to enable chat."
              className="provider-modal__alert"
            />
          )}
          {loading ? (
            <Typography.Text type="secondary">Loading…</Typography.Text>
          ) : providers.length === 0 ? (
            <Typography.Text type="secondary">No providers configured yet.</Typography.Text>
          ) : (
            <div className="provider-modal__list">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`provider-row${provider.is_active ? " provider-row--active" : ""}`}
                >
                  <div className="provider-row__meta">
                    <div className="provider-row__title">
                      <Typography.Text strong>{provider.name}</Typography.Text>
                      {provider.is_active && <Tag color="green">Active</Tag>}
                      <Tag>{provider.provider_type}</Tag>
                    </div>
                    <Typography.Text type="secondary" className="provider-row__model">
                      {provider.model}
                    </Typography.Text>
                  </div>
                  <div className="provider-row__actions">
                    {!provider.is_active && (
                      <Button size="middle" onClick={() => handleActivate(provider.id)}>
                        Activate
                      </Button>
                    )}
                    <Button size="middle" danger onClick={() => handleDelete(provider.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}

export default ProviderModal;
