using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Entity
{
    public class Coupon : BaseEntity
    {
        [MaxLength(ResonanceConstant.CoupenCodeMaxLength)]
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public DateTime ExpiryDate { get; set; }

        [MaxLength(ResonanceConstant.CouponDescriptionLength)]
        public string Description { get; set; } = string.Empty;
    }
}
