
using System.ComponentModel.DataAnnotations;

namespace TicketBooking.Repository.Model.DTO
{
    public class EventUpdateDto : EventCreateDto
    {
        [Required]
        public int Id { get; set; }
    }
}
