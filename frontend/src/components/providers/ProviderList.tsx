import { Alert, Button, Space, Tag, Typography } from "antd";
import type { ProviderDto } from "@shared/types/providers";

type ProviderListProps = {
  providers: ProviderDto[];
  loading: boolean;
  showNoActiveWarning: boolean;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
};

function ProviderList({
  providers,
  loading,
  showNoActiveWarning,
  onActivate,
  onDelete
}: ProviderListProps) {
  return (
    <section className="provider-modal__section">
      <Typography.Title level={5} className="provider-modal__title">
        Providers
      </Typography.Title>
      <Typography.Text type="secondary" className="provider-modal__subtitle">
        Choose the active model for new chats.
      </Typography.Text>
      {showNoActiveWarning && (
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
                  <Button size="middle" onClick={() => onActivate(provider.id)}>
                    Activate
                  </Button>
                )}
                <Button size="middle" danger onClick={() => onDelete(provider.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProviderList;
