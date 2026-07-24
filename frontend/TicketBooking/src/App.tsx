import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminHome from "./pages/AdminHome";
import UserHome from "./pages/UserHome";
import { APP_ROUTES } from "./Constant/appRoutes";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path={APP_ROUTES.REGISTER} element={<Register />} />
          <Route path={APP_ROUTES.LOGIN} element={<Login />} />
          <Route path={APP_ROUTES.ADMIN} element={<AdminHome />} />
          <Route path={APP_ROUTES.USER} element={<UserHome />} />
          <Route
            path="*"
            element={<Navigate to={APP_ROUTES.LOGIN} replace />}
          />
          <Route
            path={APP_ROUTES.FORGOT_PASSWORD}
            element={<ForgotPassword />}
          />
          <Route path={APP_ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
