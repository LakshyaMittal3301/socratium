import { theme } from "antd";
import type { ThemeConfig } from "antd";

export const themeConfig: ThemeConfig = {
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
};
