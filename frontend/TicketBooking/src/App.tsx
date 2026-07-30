import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminHome from "./pages/AdminHome";
import UserHome from "./pages/UserHome";
import { APP_ROUTES } from "./Constant/appRoutes";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MainLayout from "./layouts/MainLayout";
import Profile from "./pages/Profile";
import EventList from "./pages/admin/EventList";
import EventForm from "./pages/admin/EventForm";
import CouponList from "./pages/admin/CouponList";
import CouponForm from "./pages/admin/CouponForm";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path={APP_ROUTES.REGISTER} element={<Register />} />
          <Route path={APP_ROUTES.LOGIN} element={<Login />} />

          <Route
            path="*"
            element={<Navigate to={APP_ROUTES.LOGIN} replace />}
          />
          <Route
            path={APP_ROUTES.FORGOT_PASSWORD}
            element={<ForgotPassword />}
          />
          <Route path={APP_ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

          <Route element={<MainLayout />}>
            <Route path={APP_ROUTES.ADMIN} element={<AdminHome />} />
            <Route path={APP_ROUTES.USER} element={<UserHome />} />
            <Route path={APP_ROUTES.PROFILE} element={<Profile />} />
            <Route path="/admin/events" element={<EventList />} />
            <Route path="/admin/events/new" element={<EventForm />} />
             <Route path="/admin/events/:id/edit" element={<EventForm />} />
            <Route path="/admin/coupons" element={<CouponList />} />
            <Route path="/admin/coupons/new" element={<CouponForm />} />
            <Route path="/admin/coupons/:id/edit" element={<CouponForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
