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
          colorPrimary: "#5b3a24",
          fontSize: 17,
          borderRadius: 12,
          fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif'
        },
        components: {
          Button: {
            controlHeight: 36,
            fontSize: 14,
            paddingInline: 14
          },
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
