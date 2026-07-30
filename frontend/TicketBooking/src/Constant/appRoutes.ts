export const APP_ROUTES = Object.freeze({
  LOGIN: "/login",
  REGISTER: "/register",
  ADMIN: "/admin",
  USER: "/user",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD:"/reset-password",
  PROFILE:"/profile",
   EDIT_COUPON:(id:number)=>`/admin/coupons/${id}/edit`,
   CREATE_COUPON:"/admin/coupons/new"
})