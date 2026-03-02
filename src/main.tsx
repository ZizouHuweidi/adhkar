import React from "react";
import ReactDOM from "react-dom/client";
import { DirectionProvider } from "@/components/ui/direction";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DirectionProvider dir="ltr">
      <App />
    </DirectionProvider>
  </React.StrictMode>,
);
