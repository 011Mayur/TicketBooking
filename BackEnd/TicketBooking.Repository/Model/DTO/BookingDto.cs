using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Model.DTO
{
    public class CreateBookingRequestDto
    {
        public required int EventId { get; set; }
        public required int Quantity { get; set; }

        public required BookingDiscountType DiscountType { get; set; }
        public string? CouponCode { get; set; }
    }

    public class BookingCreateDto
    {
        public required int UserId { get; set; }
        public required int EventId { get; set; }
        public required int Quantity { get; set; }
        public required decimal UnitPrice { get; set; }
        public required decimal SubTotal { get; set; }
        public decimal? BulkDiscountPercentage { get; set; }
        public decimal? BulkDiscountAmount { get; set; }
        public required decimal FinalAmount { get; set; }
        public required DateTime ExpiresAt { get; set; }
        public required BookingDiscountType DiscountType { get; set; }

        public int? CouponId { get; set; }
        public string? CouponCode { get; set; }
        public decimal? CouponDiscountPercentage { get; set; }
        public decimal? CouponDiscountAmount { get; set; }
    }

    public class BookingResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal SubTotal { get; set; }
        public decimal? BulkDiscountPercentage { get; set; }
        public decimal? BulkDiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CouponCode { get; set; }
        public decimal? CouponDiscountPercentage { get; set; }
        public decimal? CouponDiscountAmount { get; set; }
        public string DiscountType { get; set; } = string.Empty;
    }

    public class EventDiscountCouponDto
    {
        public int Id { get; set; }

        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }

        public bool IsUsed { get; set; }
    }

    public class EventForPaymentSummary
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string ArtistName { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;

        public DateTime EventDate { get; set; }
        public TimeSpan EventTime { get; set; }

        public int TicketPrice { get; set; }
    }

    public class BookingSummaryDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; } = default!;
        public DateTime EventDate { get; set; }
        public TimeSpan EventTime { get; set; }
        public string Venue { get; set; } = default!;
        public int Quantity { get; set; }
        public decimal FinalAmount { get; set; }
        public string PaymentStatus { get; set; } = default!;
    }

    public class ReleaseBookingRequest
    {
        public BookingStatus Status { get; set; }
        public int BookingId { get; set; }

        public string? RazorpayPaymentId { get; set; }
    }

    public class CheckPaymentAttemptResponse
    {
        public bool PaymentAttempted { get; set; }
        public string? RazorpayPaymentId { get; set; }
    }

    public class BookingWithLockDto
    {
        public BookingResponseDto Booking { get; set; } = null!;
        public bool IsLocked { get; set; }
    }
}
