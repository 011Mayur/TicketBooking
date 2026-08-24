namespace TicketBooking.Repository.Model.DTO
{
    public class BookingCreationResult
    {
        public int? BookingId { get; set; }
        public bool SeatsAvailable { get; set; }
        public bool CouponAvailable { get; set; }
    }
}
