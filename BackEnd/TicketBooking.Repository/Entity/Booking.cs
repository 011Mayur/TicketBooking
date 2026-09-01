using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Entity
{
    public class Booking : BaseEntity
    {
        public required int UserId { get; set; }
        public required int EventId { get; set; }
        public required int Quantity { get; set; }

        public required decimal UnitPrice { get; set; }
        public required decimal SubTotal { get; set; }

        public decimal? BulkDiscountPercentage { get; set; }
        public decimal? BulkDiscountAmount { get; set; }

        public int? CouponId { get; set; }

        [MaxLength(ResonanceConstant.CoupenCodeMaxLength)]
        public string? CouponCode { get; set; }
        public decimal? CouponDiscountPercentage { get; set; }
        public decimal? CouponDiscountAmount { get; set; }

        public required decimal FinalAmount { get; set; }
        public required BookingStatus Status { get; set; } = BookingStatus.Pending;
        public required DateTime ExpiresAt { get; set; }

        [MaxLength(ResonanceConstant.RazorpayIdMaxLength)]
        public string? RazorpayOrderId { get; set; }

        [MaxLength(ResonanceConstant.RazorpayIdMaxLength)]
        public string? RazorpayPaymentId { get; set; }
        public required BookingDiscountType DiscountType { get; set; } = BookingDiscountType.None;

        public string? PaymentFailureReason { get; set; }

        public bool IsCheckedIn { get; set; } = false;
    }
}
