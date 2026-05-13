import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

// Register service worker for offline support
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("A new version is available. Reload to update?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App is ready for offline use");
  },
});

createRoot(document.getElementById("root")!).render(<App />);
