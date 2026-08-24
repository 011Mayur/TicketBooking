import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { theme } from "./Theme/Theme.ts";
import { AuthProvider } from "./Context/AuthProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode >
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
