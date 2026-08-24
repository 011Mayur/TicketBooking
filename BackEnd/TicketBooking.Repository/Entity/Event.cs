using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Entity
{
    public class Event : BaseEntity
    {
        [MaxLength(ResonanceConstant.TitleMaxLength)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(ResonanceConstant.NameMaxLength)]
        public string ArtistName { get; set; } = string.Empty;

        [MaxLength(ResonanceConstant.VenueMaxLength)]
        public string Venue { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public TimeSpan EventTime { get; set; }
        public decimal TicketPrice { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }

        public int? BulkTicketForDiscount { get; set; }

        public decimal? DiscountPercentage { get; set; }

        public string? PosterImageUrl { get; set; }

        public required int EventCategoryId { get; set; }

        [MaxLength(ResonanceConstant.DiscriptionLength)]
        public string Description { get; set; } = string.Empty;
    }
}
