import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { onIframeUnitUnloading } from "wafer-host/unit-types";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

onIframeUnitUnloading(() => {
  root.unmount();
});
