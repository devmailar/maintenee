import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root: HTMLElement | null = document.getElementById("root");

if (root) {
	createRoot(root).render(<App />);
}
