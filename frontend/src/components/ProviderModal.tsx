import { useEffect, useState } from "react";
import type { CreateProviderRequest, ProviderDto } from "@shared/types/api";

type ProviderModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function ProviderModal({ isOpen, onClose }: ProviderModalProps) {
  const [providers, setProviders] = useState<ProviderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [model, setModel] = useState("gemini-3-flash-preview");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    void loadProviders();
  }, [isOpen]);

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

  if (!isOpen) return null;

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
        body: JSON.stringify({ model: model.trim(), apiKey: apiKey.trim() })
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

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__content">
        <div className="modal__header">
          <h2>AI Providers</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <section className="modal__section">
          <h3>Active provider</h3>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : providers.length === 0 ? (
            <p className="muted">No providers configured yet.</p>
          ) : (
            <ul className="provider-list">
              {providers.map((provider) => (
                <li key={provider.id} className="provider-item">
                  <div>
                    <p className="provider-item__name">
                      {provider.name} {provider.is_active ? "(active)" : ""}
                    </p>
                    <p className="provider-item__meta">{provider.model}</p>
                  </div>
                  <div className="provider-item__actions">
                    {!provider.is_active && (
                      <button type="button" onClick={() => handleActivate(provider.id)}>
                        Activate
                      </button>
                    )}
                    <button type="button" onClick={() => handleDelete(provider.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="modal__section">
          <h3>Add provider</h3>
          <form onSubmit={handleCreate} className="provider-form">
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="My Gemini"
              />
            </label>
            <label>
              Model
              <input
                type="text"
                value={model}
                onChange={(event) => setModel(event.target.value)}
              />
            </label>
            <label>
              API key
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Paste your Gemini API key"
              />
            </label>
            <div className="provider-form__actions">
              <button type="button" onClick={handleTest} disabled={testing}>
                {testing ? "Testing..." : "Test key"}
              </button>
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save provider"}
              </button>
            </div>
            {testMessage && <p className="status">Test success: {testMessage}</p>}
          </form>
        </section>
      </div>
    </div>
  );
}

export default ProviderModal;
