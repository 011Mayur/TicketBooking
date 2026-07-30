export const API_ROUTES = Object.freeze({
  AUTH: {
    REGISTER: "/Auth/Register",
    LOGIN: "/Auth/Login",
    FORGOT_PASSWORD: "/Auth/ForgotPassword",
    RESET_PASSWORD: "/Auth/ResetPassword",
    REFRESH_TOKEN: "/Auth/Refresh",
    LOGOUT: "/Auth/Logout",
  },
  COUPON: {
    GET_ALL_ACTIVE: "/Coupon/GetAllActive",
    GET_ALL: "/Coupon/GetAll",

    DELETE: (id: number) => `/coupon/ToggleCouponStatus/${id}`,
  },
  EVENT: {
    CREATE: "/event/Create",
    UPDATE: (id: number) => `/event/Update/${id}`,
    GET_BY_ID: (id: number) => `/event/GetById/${id}`,
    GET_PAGED: "/event/GetPaged",
    UPLOAD_POSTER: "/Event/UploadPosterImage",
  },
});
