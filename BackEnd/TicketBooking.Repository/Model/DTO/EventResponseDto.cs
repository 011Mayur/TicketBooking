namespace TicketBooking.Repository.Model.DTO
{
    public class EventResponseDto
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

        public int? BulkTicketForDiscount { get; set; }

        public decimal? DiscountPercentage { get; set; }

        public List<int> CouponIds { get; set; } = [];
        public List<CouponCodeDto> AppliedCoupons { get; set; } = [];

        public string? PosterImageUrl { get; set; }

        public int EventCategoryId { get; set; }
        public int EventTypeId { get; set; }

        public string Description { get; set; } = string.Empty;
    }

    public class EventPosterDto
    {
        public string? PosterImageUrl { get; set; }
    }

    public class HomePageEvent
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;

        public string Venue { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }

        public string? PosterImageUrl { get; set; }
    }

    public class EventForBooking()
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ArtistName { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public TimeSpan EventTime { get; set; }
        public decimal TicketPrice { get; set; }

        public int AvailableSeats { get; set; }

        public int? BulkTicketForDiscount { get; set; }

        public decimal? DiscountPercentage { get; set; }

        public string? PosterImageUrl { get; set; }

        public string Description { get; set; } = string.Empty;
    }
}
