import { Alert, Button, Input, Select, Space, Typography } from "antd";
import type { OpenRouterModel, ProviderType } from "@shared/types/providers";

type ProviderFormProps = {
  providerType: ProviderType;
  name: string;
  model: string;
  apiKey: string;
  openRouterModels: OpenRouterModel[];
  modelsLoading: boolean;
  modelError: string | null;
  testMessage: string | null;
  error: string | null;
  saving: boolean;
  testing: boolean;
  modelListId: string;
  onProviderTypeChange: (value: ProviderType) => void;
  onNameChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onLoadModels: () => void;
  onTest: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function ProviderForm({
  providerType,
  name,
  model,
  apiKey,
  openRouterModels,
  modelsLoading,
  modelError,
  testMessage,
  error,
  saving,
  testing,
  modelListId,
  onProviderTypeChange,
  onNameChange,
  onModelChange,
  onApiKeyChange,
  onLoadModels,
  onTest,
  onSubmit
}: ProviderFormProps) {
  return (
    <section className="provider-modal__section">
      <Typography.Title level={5} className="provider-modal__title">
        Add provider
      </Typography.Title>
      <Typography.Text type="secondary" className="provider-modal__subtitle">
        Add your provider and store the API key locally.
      </Typography.Text>
      <form onSubmit={onSubmit} className="provider-modal__form">
        <div className="provider-modal__field">
          <Typography.Text strong>Provider</Typography.Text>
          <Select
            value={providerType}
            onChange={onProviderTypeChange}
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
            onChange={(event) => onNameChange(event.target.value)}
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
                onChange={(event) => onModelChange(event.target.value)}
                placeholder="openai/gpt-5.2"
                size="middle"
              />
              <Button size="middle" onClick={onLoadModels} loading={modelsLoading}>
                Load models
              </Button>
            </Space>
          ) : (
            <Input
              value={model}
              onChange={(event) => onModelChange(event.target.value)}
              size="middle"
            />
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
            onChange={(event) => onApiKeyChange(event.target.value)}
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
            <Button size="middle" onClick={onTest} loading={testing}>
              Test key
            </Button>
            <Button size="middle" type="primary" htmlType="submit" loading={saving}>
              Save provider
            </Button>
          </Space>
        </div>
      </form>
    </section>
  );
}

export default ProviderForm;
