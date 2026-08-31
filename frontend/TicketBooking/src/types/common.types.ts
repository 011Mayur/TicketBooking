export type Gender = "Male" | "Female";
export type Role = "Admin" | "User";
export type SortDir = "asc" | "desc";
export type EventSortColumn = "title" | "eventDate" | "ticketPrice";

export const BookingDiscountType = {
  None: "None",
  Bulk: "Bulk",
  Coupon: "Coupon",
} as const;

export type BookingDiscountTypeValue = "None" | "Bulk" | "Coupon";
export type PaymentStatus = "Pending" | "Completed" | "Failed";
