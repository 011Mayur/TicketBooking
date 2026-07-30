using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components.Forms;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Model.DTO
{
    public class EventCreateDto
    {
        [Required, MaxLength(Constant.TitleMaxLength)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(Constant.NameMaxLength)]
        public string ArtistName { get; set; } = string.Empty;

        [Required, MaxLength(Constant.VenueMaxLength)]
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

        public required bool isActive = true;

        public int? BulkTicketForDiscount { get; set; }

        public decimal? DiscountPercentage { get; set; }

        public List<int> SelectedCouponIds { get; set; } = [];

        public string? PosterImageUrl { get; set; }
    }
}
