export const API_ROUTES = Object.freeze({
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh",
    LOGOUT: "/auth/logout",
    CURRENT_USER: "/auth/current-user",
  },
  COUPON: {
    GET_ALL_ACTIVE: "/Coupon/GetAllActive",
    GET_ALL: "/Coupon/GetAll",
    CREATE: "/coupon/Create",
    GET_BY_ID: (id: number | string) => `/coupon/GetById/${id}`,
    UPDATE: (id: number | string) => `/Coupon/Update/${id}`,
    DELETE: (id: number | string) => `/coupon/ToggleCouponStatus/${id}`,
  },
  EVENT: {
    CREATE: "/event/Create",
    UPDATE: (id: number | string) => `/event/Update/${id}`,
    DELETE: (id: number | string) => `/event/Delete/${id}`,
    GET_BY_ID: (id: number | string) => `/event/GetById/${id}`,
    GET_PAGED: (id: number | string) => `/event/GetPaged/${id}`,
    UPLOAD_POSTER: "/Event/UploadPosterImage",
  },
  EVENTBOOKING: {
    EVENT: (id: string | number) => `/EventBooking/Event/${id}`,
  },
  HOME: {
    GET_ALL_EVENTS: "/Home/GetAttEvents",
    SEARCH_EVENTS: "/Home/SearchEvents",
    GET_EVENT_TYPES: "/Home/GetEventTypes",
  },
  EVENT_MANAGEMENT: {
    TYPES: "/event-management/types",
    TYPES_ID: (id: number | string) => `/event-management/types/${id}`,
    CATEGORIES_BY_TYPE_ID: (id: number | string) =>
      `/event-management/types/${id}/categories`,
    PAST_EVENT_BY_CATEGORY: (id: number | string) =>
      `/event-management/categories/${id}/past-events`,
    CATEGORIES: "/event-management/categories",
    CATEGORIES_ID: (id: number | string) => `/event-management/categories/${id}`,
  },
  BOOKING: {
    CREATE: "/bookings/create-bookings",
    GET_BY_ID: (id: number | string) => `/bookings/get-booking/${id}`,
    COUPON_APPLY: "/bookings/apply-coupon",
    EVENT_COUPON: (eventId: number | string) => `/bookings/get-coupons/${eventId}`,
    EVENT_BY_ID: (eventId: number | string) => `/bookings/get-event/${eventId}`,
    CANCEL: (bookingId: number | string) => `/bookings/cancel/${bookingId}`,
    RELEASE: (bookingId: number | string) => `/bookings/release/${bookingId}`,
    MY_BOOKINGS: `/bookings/my-bookings`,
    VALIDATE_CHECKOUT: "/bookings/validate-checkout",
  },
  PAYMENT: {
    CREATE_ORDER: "/payment/create-order",
    VERIFY: "/payment/verify",
    CHECK_ATTEMPT: (orderId: string) => `/payment/check-attempt/${orderId}`,
  },
});