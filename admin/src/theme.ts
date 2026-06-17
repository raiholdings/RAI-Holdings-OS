import type { ThemeConfig } from "antd";

// RAI brand: Navy #0F2A47 + Gold #C9A227 + Blue #2E75B6, Montserrat.
export const raiTheme: ThemeConfig = {
  token: {
    colorPrimary: "#0F2A47",
    colorInfo: "#2E75B6",
    colorLink: "#2E75B6",
    colorTextHeading: "#0F2A47",
    fontFamily: "'Montserrat', system-ui, sans-serif",
    borderRadius: 6,
  },
  components: {
    Layout: { headerBg: "#0F2A47", siderBg: "#0F2A47", triggerBg: "#0b2138" },
    Menu: { darkItemBg: "#0F2A47", darkItemSelectedBg: "#2E75B6" },
    Button: { colorPrimary: "#0F2A47" },
  },
};

export const RAI_GOLD = "#C9A227";
