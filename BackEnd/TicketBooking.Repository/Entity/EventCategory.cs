using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Entity
{
    public class EventCategory : BaseEntity
    {
        [Required]
        [MaxLength(ResonanceConstant.EventCategory)]
        public required string Name { get; set; }

        [Required]
        public required int EventTypeId { get; set; }
    }
}
