import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Load analytics script only when configured
const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const analyticsWebsiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
if (analyticsEndpoint && analyticsWebsiteId) {
  const s = document.createElement("script");
  s.defer = true;
  s.src = `${analyticsEndpoint}/umami`;
  s.dataset.websiteId = analyticsWebsiteId;
  document.body.appendChild(s);
}
