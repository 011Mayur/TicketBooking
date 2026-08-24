namespace TicketBooking.Repository.Entity
{
    public class CouponUsage
    {
        public int Id { get; set; }
        public int CouponId { get; set; }
        public int UserId { get; set; }
        public DateTime UsedAt { get; set; }

        public Coupon? Coupon { get; set; }
    }
}
