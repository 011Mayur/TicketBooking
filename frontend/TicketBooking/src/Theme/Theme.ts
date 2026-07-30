import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#4540e1",
      light: "#6A66E7",
      dark: "#1C1A5A",
      contrastText: "#FFFFFF",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
    secondary: {
      main: "#6A66E7",
      contrastText: "#FFFFFF",
    },
    divider: "#EEEEEE",
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
    error: {
      main: "#EF5350",
    },
    success: {
      main: "#66BB6A",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h5: {
      fontSize: "1.5rem",
      fontWeight: 600,
      "@media (max-width:600px)": {
        fontSize: "1.25rem",
      },
    },
    h6: {
      fontSize: "1.25rem",
      "@media (max-width:600px)": {
        fontSize: "1.1rem",
      },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined" as const,
      },
    },
  },
});
