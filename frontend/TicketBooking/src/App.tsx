import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { APP_ROUTES } from "./Constant/appRoutes";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import EventList from "./pages/admin/EventList";
import CouponList from "./pages/admin/CouponList";
import CouponForm from "./pages/admin/CouponForm";
import Home from "./pages/user/Home";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import EventDetails from "./pages/user/EventDetails";
import UserLogin from "./pages/user/UserLogin";
import EventTypeManagement from "./pages/admin/EventTypeManagement";
import Checkout from "./pages/user/Checkout";
import Payment from "./pages/user/Payment/Payment";
import MyBookings from "./pages/MyBookings/MyBookings";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes (No Layout) */}
          <Route path={APP_ROUTES.REGISTER} element={<Register />} />
          <Route path={APP_ROUTES.ADMIN_LOGIN} element={<Login />} />
          <Route path={APP_ROUTES.USER_LOGIN} element={<UserLogin />} />
          <Route
            path={APP_ROUTES.FORGOT_PASSWORD}
            element={<ForgotPassword />}
          />
          <Route path={APP_ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route
              path={APP_ROUTES.EVENT_MANAGEMENT}
              element={<EventTypeManagement />}
            />
            <Route path={APP_ROUTES.PROFILE} element={<Profile />} />
            <Route path="/admin/events" element={<EventList />} />
            <Route path="/admin/coupons" element={<CouponList />} />
            <Route path="/admin/coupons/new" element={<CouponForm />} />
            <Route path="/admin/coupons/:id/edit" element={<CouponForm />} />
          </Route>

          {/* User Routes */}
          <Route element={<UserLayout />}>
            <Route path={APP_ROUTES.HOME} element={<Home />} />
            <Route
              path={APP_ROUTES.EVENT(":eventId")}
              element={<EventDetails />}
            />
            <Route
              path={APP_ROUTES.CHECKOUT(":eventId")}
              element={<Checkout />}
            />
            <Route
              path={APP_ROUTES.PAYMENT(":eventId")}
              element={<Payment />}
            />
            <Route path={APP_ROUTES.MY_BOOKINGS} element={<MyBookings />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to={APP_ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
