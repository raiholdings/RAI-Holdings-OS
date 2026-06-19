import type { CapacitorConfig } from "@capacitor/cli";

// RAI OS mobile shell. Loads the live workspace web app (thin shell). For store
// approval, add native feel: push (FCM/APNs), deep links, biometric (optional).
const config: CapacitorConfig = {
  appId: "vn.raiholdings.os",
  appName: "RAI OS",
  webDir: "www",
  // Thin shell → load the production workspace. Comment out `server` to ship a
  // bundled offline-capable build in www/ instead.
  server: {
    url: "https://workspace.raiholdings.vn",
    cleartext: false,
  },
  backgroundColor: "#0a0b10",
  ios: { contentInset: "always", backgroundColor: "#0a0b10" },
  android: { backgroundColor: "#0a0b10" },
  plugins: {
    SplashScreen: { launchShowDuration: 800, backgroundColor: "#0a0b10", showSpinner: false },
  },
};

export default config;
