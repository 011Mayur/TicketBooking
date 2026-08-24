namespace TicketBooking.Repository.Model.DTO
{
    public class CouponValidationDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsLinkedToEvent { get; set; }
        public bool AlreadyUsedByUser { get; set; }
    }
}