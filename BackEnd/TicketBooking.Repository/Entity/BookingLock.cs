using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Entity
{
    public class BookingLock : BaseEntity
    {
        [Required]
        public required int EventId { get; set; }

        [Required]
        public required int UserId { get; set; }

        [Required]
        public required int Quantity { get; set; }

        [Required]
        [MaxLength(ResonanceConstant.RazorpayIdMaxLength)]
        public required string RazorpayOrderId { get; set; }

        public required DateTime ExpiresAt { get; set; }
        public required decimal UnitPrice { get; set; }
        public required decimal SubTotal { get; set; }
        public decimal? BulkDiscountPercentage { get; set; }
        public decimal? BulkDiscountAmount { get; set; }
        public int? CouponId { get; set; }
        public string? CouponCode { get; set; }
        public decimal? CouponDiscountPercentage { get; set; }
        public decimal? CouponDiscountAmount { get; set; }
        public required decimal FinalAmount { get; set; }
        public required string DiscountType { get; set; }
        public virtual Event? Event { get; set; }
        public virtual User? User { get; set; }
    }
}
