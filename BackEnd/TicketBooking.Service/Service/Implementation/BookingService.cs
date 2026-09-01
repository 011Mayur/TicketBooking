using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepo;
        private readonly IBookingLockRepository _bookingLockRepo;
        private readonly IEventService _eventService;
        private readonly ICouponService _couponService;

        private static readonly TimeSpan BookingExpiry = TimeSpan.FromMinutes(15);
        private static readonly TimeSpan LockExpiry = TimeSpan.FromMinutes(15);

        static BookingService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public BookingService(
            IBookingRepository bookingRepo,
            IBookingLockRepository bookingLockRepo,
            IEventService eventService,
            ICouponService couponService
        )
        {
            _bookingRepo = bookingRepo;
            _bookingLockRepo = bookingLockRepo;
            _eventService = eventService;
            _couponService = couponService;
        }

        /// <summary>
        /// NEW FLOW: On checkout page - just validate, don't create booking
        /// Moved to PaymentService: CreatePaymentOrderAsync creates the lock
        /// </summary>
        public async Task<bool> ValidateAndCheckoutAsync(int userId, CreateBookingRequestDto dto)
        {
            if (dto.Quantity < 1)
                throw new ValidationException(ExceptionMessage.MinimumQuntity);

            EventForBooking evt = await _eventService.GetEventForBooking(dto.EventId);

            DateTime eventDateTime = evt.EventDate.Date + evt.EventTime;
            if (eventDateTime < DateTime.UtcNow)
                throw new BusinessRuleException(ExceptionMessage.EventEnded);

            // Check available seats (considering active locks)
            int totalLocked = await _bookingLockRepo.GetTotalLockedQuantityAsync(dto.EventId);
            int actualAvailable = evt.AvailableSeats - totalLocked;

            if (actualAvailable < dto.Quantity)
                throw new BusinessRuleException(ExceptionMessage.NotEnoughSeats);

            // Validate discount eligibility if needed
            if (dto.DiscountType == BookingDiscountType.Bulk)
            {
                bool bulkEligible =
                    evt.BulkTicketForDiscount.HasValue
                    && evt.DiscountPercentage.HasValue
                    && dto.Quantity >= evt.BulkTicketForDiscount.Value;

                if (!bulkEligible)
                    throw new BusinessRuleException(ExceptionMessage.BulkDiscountNotEligible);
            }

            // Validate coupon if provided
            if (dto.DiscountType == BookingDiscountType.Coupon)
            {
                if (string.IsNullOrWhiteSpace(dto.CouponCode))
                    throw new ValidationException(ExceptionMessage.CouponCodeRequired);

                await _couponService.ValidateCouponAsync(dto.CouponCode, dto.EventId, userId);
            }

            return true;
        }

        /// <summary>
        /// NEW: Create booking ONLY when payment is successful or failed
        /// Called from PaymentService after payment verification
        /// </summary>
        public async Task<BookingResponseDto> CreateBookingOnPaymentAsync(
            int userId,
            int eventId,
            int quantity,
            BookingDiscountType discountType,
            string? couponCode,
            BookingStatus status
        ) // Paid or Failed
        {
            if (status != BookingStatus.Paid && status != BookingStatus.Failed)
                throw new ValidationException(
                    "Booking can only be created with Paid or Failed status"
                );

            EventForBooking evt = await _eventService.GetEventForBooking(eventId);
            DateTime eventDateTime = evt.EventDate.Date + evt.EventTime;
            if (eventDateTime < DateTime.UtcNow)
                throw new BusinessRuleException(ExceptionMessage.EventEnded);

            decimal unitPrice = evt.TicketPrice;
            decimal subTotal = unitPrice * quantity;

            decimal? bulkDiscountPercentage = null;
            decimal? bulkDiscountAmount = null;
            int? couponId = null;
            decimal? couponDiscountPercentage = null;
            decimal? couponDiscountAmount = null;

            switch (discountType)
            {
                case BookingDiscountType.Bulk:
                    bool bulkEligible =
                        evt.BulkTicketForDiscount.HasValue
                        && evt.DiscountPercentage.HasValue
                        && quantity >= evt.BulkTicketForDiscount.Value;

                    if (!bulkEligible)
                        throw new BusinessRuleException(ExceptionMessage.BulkDiscountNotEligible);

                    bulkDiscountPercentage = evt.DiscountPercentage!.Value;
                    bulkDiscountAmount = Math.Round(
                        subTotal * bulkDiscountPercentage.Value / 100m,
                        2
                    );
                    break;

                case BookingDiscountType.Coupon:
                    if (string.IsNullOrWhiteSpace(couponCode))
                        throw new ValidationException(ExceptionMessage.CouponCodeRequired);

                    CouponValidationDto coupon = await _couponService.ValidateCouponAsync(
                        couponCode,
                        eventId,
                        userId
                    );

                    couponId = coupon.Id;
                    couponCode = coupon.Code;
                    couponDiscountPercentage = coupon.DiscountPercentage;
                    couponDiscountAmount = Math.Round(
                        subTotal * coupon.DiscountPercentage / 100m,
                        2
                    );
                    break;
            }

            decimal finalAmount =
                subTotal - (bulkDiscountAmount ?? 0m) - (couponDiscountAmount ?? 0m);

            BookingCreateDto bookingCreateDto = new()
            {
                UserId = userId,
                EventId = eventId,
                Quantity = quantity,
                UnitPrice = unitPrice,
                SubTotal = subTotal,
                DiscountType = discountType,
                BulkDiscountPercentage = bulkDiscountPercentage,
                BulkDiscountAmount = bulkDiscountAmount,
                CouponId = couponId,
                CouponCode = couponCode,
                CouponDiscountPercentage = couponDiscountPercentage,
                CouponDiscountAmount = couponDiscountAmount,
                FinalAmount = finalAmount,
                // Only set expiry for Paid status
                ExpiresAt =
                    status == BookingStatus.Paid
                        ? DateTime.UtcNow.Add(BookingExpiry)
                        : DateTime.UtcNow,
            };

            BookingCreationResult result = await _bookingRepo.CreateBookingAsync(
                bookingCreateDto,
                status
            );

            // For Paid status, check seat availability one more time
            if (status == BookingStatus.Paid)
            {
                if (!result.SeatsAvailable)
                    throw new BusinessRuleException(ExceptionMessage.NotEnoughSeats);

                if (!result.CouponAvailable)
                    throw new BusinessRuleException(ExceptionMessage.CouponAlreadyUsed);
            }

            return await GetBookingByIdAsync(result.BookingId!.Value, userId);
        }

        public async Task<BookingResponseDto> GetBookingByIdAsync(int id, int currentUserId)
        {
            BookingResponseDto? booking = await _bookingRepo.GetBookingByIdAsync(id);

            if (booking is null || booking.UserId != currentUserId)
                throw new ResourceNotFoundException(
                    ExceptionMessage.ResourceNotFound(id, "Booking")
                );

            return booking;
        }

        public async Task<List<EventDiscountCouponDto>> GetEventCouponsAsync(
            int eventId,
            int userId
        )
        {
            return await _bookingRepo.GetEventCouponsAsync(eventId, userId);
        }

        public async Task<EventForPaymentSummary?> GetEventForPaymentSummaryByIdAsync(int eventId)
        {
            EventForPaymentSummary? result = await _bookingRepo.GetEventForPaymentSummaryByIdAsync(
                eventId
            );
            if (result is null)
            {
                throw new ResourceNotFoundException(
                    ExceptionMessage.ResourceNotFound(eventId, "Event")
                );
            }

            return result;
        }

        public async Task<IEnumerable<BookingSummaryDto>> GetMyBookingsAsync(int userId) =>
            await _bookingRepo.GetMyBookingsAsync(userId);

        public async Task ExpireStaleBookingsAsync()
        {
            List<int> expiredIds = await _bookingRepo.GetExpiredPendingBookingIdsAsync();

            foreach (int id in expiredIds)
                await _bookingRepo.ReleaseBookingAsync(id);

            // Also cleanup expired locks
            await _bookingLockRepo.DeleteExpiredLocksAsync();
        }

        public async Task<bool> ReleaseBookingAsync(int bookingId, int userId)
        {
            BookingResponseDto? booking = await _bookingRepo.GetBookingByIdAsync(bookingId);
            if (booking is null || booking.UserId != userId)
                throw new ResourceNotFoundException(
                    ExceptionMessage.ResourceNotFound(bookingId, "Booking")
                );

            return await _bookingRepo.ReleaseBookingAsync(bookingId);
        }

        public async Task<bool> ReleaseBookingAsync(int bookingId, int userId, BookingStatus status)
        {
            BookingResponseDto? booking = await _bookingRepo.GetBookingByIdAsync(bookingId);
            if (booking is null || booking.UserId != userId)
                throw new ResourceNotFoundException(
                    ExceptionMessage.ResourceNotFound(bookingId, "Booking")
                );

            return await _bookingRepo.ReleaseBookingAsync(bookingId, status);
        }

        public async Task<byte[]> GenerateTicketPdfAsync(int bookingId, int userId)
        {
            var booking = await GetBookingByIdAsync(bookingId, userId);
            var eventDetails = await _eventService.GetEventByIdAsync(booking.EventId);

            if (eventDetails == null)
            {
                throw new Exception("Event not found for this booking.");
            }

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(new PageSize(800, 380));
                    page.Margin(0);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12).FontFamily("Arial"));

                    page.Content()
                        .Background(Colors.White)
                        .Padding(32)
                        .Column(column =>
                        {
                            // Brand and Badge Row
                            column
                                .Item()
                                .Row(r =>
                                {
                                    r.RelativeItem()
                                        .Text("TICKETBOOKING")
                                        .FontSize(16)
                                        .Black()
                                        .FontColor("#4540e1");
                                    r.AutoItem()
                                        .Background("#E8F5E9")
                                        .PaddingHorizontal(12)
                                        .PaddingVertical(6)
                                        .Text("✓ CONFIRMED")
                                        .FontSize(12)
                                        .Bold()
                                        .FontColor("#2E7D32");
                                });

                            // Event Title
                            column
                                .Item()
                                .PaddingTop(30)
                                .Text(booking.EventTitle)
                                .FontSize(28)
                                .Bold()
                                .FontColor(Colors.Black);

                            // Date & Venue Details
                            column
                                .Item()
                                .PaddingTop(25)
                                .Row(r =>
                                {
                                    r.RelativeItem()
                                        .Column(c =>
                                        {
                                            c.Item()
                                                .Text("DATE & TIME")
                                                .FontSize(10)
                                                .SemiBold()
                                                .FontColor(Colors.Grey.Darken1);
                                            c.Item()
                                                .Text(
                                                    $"{eventDetails.EventDate:MMM dd, yyyy} • {eventDetails.EventTime:hh\\:mm}"
                                                )
                                                .FontSize(15)
                                                .Medium()
                                                .FontColor(Colors.Grey.Darken3);
                                        });
                                    r.RelativeItem()
                                        .Column(c =>
                                        {
                                            c.Item()
                                                .Text("VENUE")
                                                .FontSize(10)
                                                .SemiBold()
                                                .FontColor(Colors.Grey.Darken1);
                                            c.Item()
                                                .Text(eventDetails.Venue)
                                                .FontSize(15)
                                                .Medium()
                                                .FontColor(Colors.Grey.Darken3);
                                        });
                                });

                            // Divider
                            column
                                .Item()
                                .PaddingTop(25)
                                .LineHorizontal(1)
                                .LineColor(Colors.Grey.Lighten2);

                            // Financials & IDs
                            column
                                .Item()
                                .PaddingTop(20)
                                .Row(r =>
                                {
                                    r.RelativeItem()
                                        .Column(c =>
                                        {
                                            c.Item()
                                                .Text("TICKETS")
                                                .FontSize(10)
                                                .SemiBold()
                                                .FontColor(Colors.Grey.Darken1);
                                            c.Item()
                                                .Text($"{booking.Quantity}")
                                                .FontSize(22)
                                                .Bold()
                                                .FontColor(Colors.Black);
                                        });
                                    r.RelativeItem()
                                        .Column(c =>
                                        {
                                            c.Item()
                                                .Text("AMOUNT PAID")
                                                .FontSize(10)
                                                .SemiBold()
                                                .FontColor(Colors.Grey.Darken1);
                                            c.Item()
                                                .Text($"Rs. {booking.FinalAmount:F2}")
                                                .FontSize(22)
                                                .Bold()
                                                .FontColor(Colors.Black);
                                        });
                                    r.RelativeItem()
                                        .Column(c =>
                                        {
                                            c.Item()
                                                .Text("BOOKING ID")
                                                .FontSize(10)
                                                .SemiBold()
                                                .FontColor(Colors.Grey.Darken1);
                                            c.Item()
                                                .Text($"#{booking.Id}")
                                                .FontSize(22)
                                                .Bold()
                                                .FontColor(Colors.Black);
                                        });
                                });

                            // Footer Note
                            column
                                .Item()
                                .PaddingTop(35)
                                .Text(
                                    "Present this ticket at the venue entrance for entry. Valid for one-time use only."
                                )
                                .FontSize(11)
                                .Italic()
                                .FontColor(Colors.Grey.Medium);
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}
