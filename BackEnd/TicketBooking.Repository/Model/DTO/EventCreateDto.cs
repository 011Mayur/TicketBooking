using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Model.DTO
{
    public class EventCreateDto
    {
        [Required, MaxLength(ResonanceConstant.TitleMaxLength)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(ResonanceConstant.NameMaxLength)]
        public string ArtistName { get; set; } = string.Empty;

        [Required, MaxLength(ResonanceConstant.VenueMaxLength)]
        public string Venue { get; set; } = string.Empty;

        [Required]
        public DateTime EventDate { get; set; }

        [Required]
        [Range(
            typeof(TimeSpan),
            "00:00:00",
            "23:59:59",
            ErrorMessage = ValidationMessage.EventTimeRangeValidation
        )]
        public TimeSpan EventTime { get; set; }

        [
            Required,
            Range(1, double.MaxValue, ErrorMessage = ValidationMessage.TicketPriceRangeValidation)
        ]
        public decimal TicketPrice { get; set; }

        [
            Required,
            Range(1, int.MaxValue, ErrorMessage = ValidationMessage.TotalSeatsRangeValidation)
        ]
        public int TotalSeats { get; set; }

        [
            Required,
            Range(1, int.MaxValue, ErrorMessage = ValidationMessage.EventCategoryNameRequired)
        ]
        public int EventCategoryId { get; set; }

        public required bool isActive = true;

        public int? BulkTicketForDiscount { get; set; }

        public decimal? DiscountPercentage { get; set; }

        public List<int> SelectedCouponIds { get; set; } = [];

        public string? PosterImageUrl { get; set; }

        [Required, MaxLength(ResonanceConstant.DiscriptionLength)]
        public string Description { get; set; } = string.Empty;
    }
}
