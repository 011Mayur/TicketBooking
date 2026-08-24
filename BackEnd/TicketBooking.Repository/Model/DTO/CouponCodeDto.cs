namespace TicketBooking.Repository.Model.DTO
{
    public class CouponCodeDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
    }
}
