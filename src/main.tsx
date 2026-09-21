import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const redirect = sessionStorage.getItem("spa-redirect");
if (redirect) {
  sessionStorage.removeItem("spa-redirect");
  if (redirect !== location.pathname + location.search + location.hash) {
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
