import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Fallback if index.html restore hasn't run yet (e.g. cached HTML + new JS).
const spaMatch = location.search.match(/[?&]spa=([^&]*)/);
if (spaMatch) {
  const redirect = decodeURIComponent(spaMatch[1]);
  if (redirect.startsWith("/")) {
    history.replaceState(null, "", redirect);
  }
}

const basename =
  import.meta.env.BASE_URL === "/"
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
