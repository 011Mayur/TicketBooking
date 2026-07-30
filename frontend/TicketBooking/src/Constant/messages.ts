export const MESSAGES = Object.freeze({
  GENERAL_ERROR: "Something went wrong. Try again.",
  AUTH: {
    REGISTER_SUCCESS: "Registration successful. Please log in.",
    REGISTER_FAIL_DEFAULT: "Registration failed. Try again.",
    LOGIN_SUCCESS: "Login successful.",
    LOGIN_FAIL_DEFAULT: "Invalid email or password.",
    LINK_EXPIRED: "This reset link is invalid or has expired.",
  },
  ERROR: {
    FAILED_LOAD_EVENTS: "Failed to load events.",
    EVENT_DELETED: "Failed to delete event.",
    FAILED_LOAD_COUPONS: "Failed to load coupons.",
    FAILED_DELETE_COUPON:"Failed to delete coupon.",
    FAILED_SAVE_COUPONS: "Failed to save coupons.",
  },
  SUCCESS: {
    EVENT_DELETED: "Event deleted.",
    UPDATE_EVENT: "Event Updated",
    CREATE_EVENT: "Event Created",
    FAILED_SAVE_EVENT: "Failed to save event.",
    TOGGLE_COUPON: (newStatus: string) => `Coupon marked ${newStatus}.`,
    UPDATED_COUPON:"Coupon updated.",
     CREATED_COUPON:"Coupon created.",
     REMOVED_IMAGE:"Image removed."
  },
});
