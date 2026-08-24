using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Model.DTO
{
    public class EventTypeListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CategoryCount { get; set; }
        public bool CanDelete { get; set; }
        public string? DeletionReason { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class EventTypeCreateUpdateDto
    {
        [Required(ErrorMessage = ValidationMessage.EventTypeNameRequired)]
        [MaxLength(ResonanceConstant.EventType, ErrorMessage = ValidationMessage.EventTypeName)]
        public string Name { get; set; } = string.Empty;
    }

    public class EventCategoryListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int EventTypeId { get; set; }
        public int ActiveEventCount { get; set; }
        public int PastEventCount { get; set; }
        public bool CanDelete { get; set; }
        public string? DeletionReason { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class EventCategoryCreateUpdateDto
    {
        [Required(ErrorMessage = ValidationMessage.EventCategoryNameRequired)]
        [MaxLength(ResonanceConstant.EventCategory, ErrorMessage = ValidationMessage.EventCategoryName)]
        public string Name { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = ValidationMessage.PositiveId)]
        public int EventTypeId { get; set; }
    }

    public class PastEventDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ArtistName { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public TimeSpan EventTime { get; set; }
        public decimal TicketPrice { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }
        public bool IsActive { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class DeletionResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? ErrorCode { get; set; }
    }
}
