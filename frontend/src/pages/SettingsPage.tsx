import { Card, Typography } from "antd";

function SettingsPage() {
  return (
    <div className="settings">
      <Card className="settings__card">
        <Typography.Title level={4}>Settings</Typography.Title>
        <Typography.Paragraph type="secondary">
          Provider configuration lives in the AI Settings button. More preferences will land here as
          we iterate.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}

export default SettingsPage;
