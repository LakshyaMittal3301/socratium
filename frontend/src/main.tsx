import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import "antd/dist/reset.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm],
        token: {
          colorBgLayout: "#f6f1e7",
          colorBgContainer: "#fffaf2",
          colorText: "#1e1a15",
          colorTextSecondary: "#6f6458",
          colorBorder: "#e6dccb",
          colorPrimary: "#8a6a3a",
          fontSize: 16,
          borderRadius: 12,
          fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif'
        },
        components: {
          Layout: {
            headerBg: "#f6f1e7",
            bodyBg: "#f6f1e7",
            siderBg: "#f2ecdf"
          }
        }
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
);
