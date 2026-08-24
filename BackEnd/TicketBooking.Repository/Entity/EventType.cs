using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Entity
{
    public class EventType : BaseEntity
    {
        [Required]
        [MaxLength(ResonanceConstant.EventType)]
        public required string Name { get; set; }
    }
}
