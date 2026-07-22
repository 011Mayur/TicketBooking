import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";

const theme = createTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  </StrictMode>,
);
