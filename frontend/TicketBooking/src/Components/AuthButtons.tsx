// Components/AuthButtons.tsx
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../Constant/appRoutes";

const AuthButtons = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button variant="outlined" onClick={() => navigate(APP_ROUTES.USER_LOGIN)}>
        Login
      </Button>
      <Button variant="contained" onClick={() => navigate(APP_ROUTES.REGISTER)}>
        Register
      </Button>
    </Box>
  );
};

export default AuthButtons;