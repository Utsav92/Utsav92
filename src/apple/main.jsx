import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./apple-tokens.css";
import AppleApp from "./AppleApp";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppleApp />
  </StrictMode>
);
