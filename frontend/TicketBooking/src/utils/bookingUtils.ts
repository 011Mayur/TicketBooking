import type { BookingSummaryResponse } from "../types";

export type BookingCategory = "upcoming" | "past" | "pending" | "failed";

export const classifyBooking = (booking: BookingSummaryResponse): BookingCategory => {
    if (booking.paymentStatus === "Failed") return "failed";
    if (booking.paymentStatus === "Pending") return "pending";

    const [h, m] = booking.eventTime.split(":").map(Number);
    const eventDateTime = new Date(booking.eventDate);
    eventDateTime.setHours(h, m);

    return eventDateTime.getTime() < Date.now() ? "past" : "upcoming";
};

export const CATEGORY_META: Record<BookingCategory, { label: string; color: "success" | "default" | "warning" | "error" }> = {
    upcoming: { label: "Upcoming", color: "success" },
    past: { label: "Past", color: "default" },
    pending: { label: "Pending Payment", color: "warning" },
    failed: { label: "Payment Failed", color: "error" },
};