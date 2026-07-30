using System.ComponentModel.DataAnnotations;

namespace TicketBooking.Repository.Entity
{
    public class EventCouponCode
    {
        [Key]
        public int Id { get; set; }

        public required int EventId { get; set; }

        public required int CouponId { get; set; }
    }
}
