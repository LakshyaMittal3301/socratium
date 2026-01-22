import { useEffect, useMemo, useState } from "react";
import { Button, Layout, Menu, Space, Typography } from "antd";
import {
  BookOutlined,
  ReadOutlined,
  SettingOutlined,
  SlidersOutlined
} from "@ant-design/icons";
import type { BookDto } from "@shared/types/api";
import LibraryPage from "./pages/LibraryPage";
import ReaderPage from "./pages/ReaderPage";
import SettingsPage from "./pages/SettingsPage";
import ProviderModal from "./components/ProviderModal";
import "./App.css";

const { Header, Sider, Content } = Layout;

type AppView = "library" | "reader" | "settings";

function App() {
  const debugEnabled = import.meta.env.VITE_DEBUG === "true";
  const [books, setBooks] = useState<BookDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppView>("library");
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    void loadBooks();
  }, []);

  const activeBook = books.find((book) => book.id === activeBookId) ?? null;

  useEffect(() => {
    if (activeBookId && !activeBook) {
      setActiveBookId(null);
      setActiveView("library");
    }
  }, [activeBookId, activeBook]);

  useEffect(() => {
    if (activeView !== "library") {
      setShowUpload(false);
    }
  }, [activeView]);

  async function loadBooks() {
    setError(null);
    try {
      const res = await fetch("/api/books");
      if (!res.ok) {
        throw new Error(`Failed to load books (${res.status})`);
      }
      const data = (await res.json()) as BookDto[];
      setBooks(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load books");
    }
  }

  async function handleUpload(file: File): Promise<boolean> {
    setStatus(null);
    setError(null);

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/books/upload", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `Upload failed (${res.status})`);
      }
      setStatus("Uploaded.");
      await loadBooks();
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return false;
    } finally {
      setUploading(false);
    }
  }

  function handleOpenBook(bookId: string) {
    setActiveBookId(bookId);
    setActiveView("reader");
  }

  const menuItems = useMemo(
    () => [
      { key: "library", icon: <BookOutlined />, label: "Library" },
      {
        key: "reader",
        icon: <ReadOutlined />,
        label: "Reader",
        disabled: !activeBook
      },
      { key: "settings", icon: <SettingOutlined />, label: "Settings" }
    ],
    [activeBook]
  );

  const isReaderView = activeView === "reader";
  const headerTitle =
    activeView === "reader"
      ? activeBook?.title ?? "Reader"
      : activeView === "settings"
        ? "Settings"
        : "Library";
  const headerSubtitle =
    activeView === "reader"
      ? "Reading workspace"
      : activeView === "settings"
        ? "Preferences and configuration"
        : "Manage your books";

  const content = (() => {
    if (activeView === "reader") {
      if (!activeBook) {
        return (
          <div className="page-placeholder">
            <Typography.Text type="secondary">
              Pick a book from the library to start reading.
            </Typography.Text>
          </div>
        );
      }
      return <ReaderPage book={activeBook} />;
    }
    if (activeView === "settings") {
      return <SettingsPage />;
    }
    return (
      <LibraryPage
        books={books}
        uploading={uploading}
        status={status}
        error={error}
        onUpload={handleUpload}
        onOpenBook={handleOpenBook}
        showUpload={showUpload}
        onOpenUpload={() => setShowUpload(true)}
        onCloseUpload={() => setShowUpload(false)}
        debugEnabled={debugEnabled}
      />
    );
  })();

  const headerActions = (
    <Space>
      {activeView === "library" && (
        <>
          <Button onClick={loadBooks}>Refresh</Button>
          <Button type="primary" onClick={() => setShowUpload(true)}>
            Add book
          </Button>
        </>
      )}
      <Button type="default" icon={<SlidersOutlined />} onClick={() => setShowProviders(true)}>
        AI Settings
      </Button>
    </Space>
  );

  return (
    <Layout className="app-shell">
      <Sider
        className="app-sider"
        collapsed={navCollapsed}
        collapsible
        onCollapse={(value) => setNavCollapsed(value)}
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
          onClick={(event) => {
            const nextView = event.key as AppView;
            if (nextView === "reader" && !activeBook) {
              setActiveView("library");
              return;
            }
            setActiveView(nextView);
          }}
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
            {content}
          </div>
        </Content>
      </Layout>
      <ProviderModal isOpen={showProviders} onClose={() => setShowProviders(false)} />
    </Layout>
  );
}

export default App;
