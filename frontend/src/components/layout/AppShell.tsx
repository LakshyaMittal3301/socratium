import type { ReactNode } from "react";
import type { MenuProps } from "antd";
import { Layout, Menu, Typography } from "antd";

const { Header, Sider, Content } = Layout;

type AppShellProps = {
  navCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  activeView: string;
  menuItems: MenuProps["items"];
  onSelectView: (view: string) => void;
  headerTitle: string;
  headerSubtitle: string;
  isReaderView: boolean;
  headerActions: ReactNode;
  children: ReactNode;
};

function AppShell({
  navCollapsed,
  onCollapse,
  activeView,
  menuItems,
  onSelectView,
  headerTitle,
  headerSubtitle,
  isReaderView,
  headerActions,
  children
}: AppShellProps) {
  return (
    <Layout className="app-shell">
      <Sider
        className="app-sider"
        collapsed={navCollapsed}
        collapsible
        onCollapse={onCollapse}
        collapsedWidth={72}
        width={240}
      >
        <div className="app-brand">
          <span className="app-brand__mark">S</span>
          {!navCollapsed && <span className="app-brand__name">Socratium</span>}
        </div>
        <Menu
          className="app-menu"
          mode="inline"
          selectedKeys={[activeView]}
          items={menuItems}
          onClick={(event) => onSelectView(event.key)}
        />
      </Sider>

      <Layout>
        <Header className={`app-header${isReaderView ? " app-header--reader" : ""}`}>
          {isReaderView ? (
            <>
              <Typography.Title
                level={4}
                className="app-header__compact-title"
                ellipsis={{ tooltip: headerTitle }}
              >
                {headerTitle}
              </Typography.Title>
              {headerActions}
            </>
          ) : (
            <>
              <div className="app-header__title">
                <Typography.Text className="app-header__eyebrow" type="secondary">
                  Socratium
                </Typography.Text>
                <Typography.Title level={4}>{headerTitle}</Typography.Title>
                <Typography.Text type="secondary">{headerSubtitle}</Typography.Text>
              </div>
              {headerActions}
            </>
          )}
        </Header>
        <Content className={`app-content${isReaderView ? " app-content--reader" : ""}`}>
          <div className={`page-container${isReaderView ? " page-container--reader" : ""}`}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppShell;
