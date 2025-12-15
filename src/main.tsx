import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GlobalProviders } from "@/providers/GlobalProviders";
import "./index.css"; 

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalProviders>
      <App />
    </GlobalProviders>
  </React.StrictMode>
);