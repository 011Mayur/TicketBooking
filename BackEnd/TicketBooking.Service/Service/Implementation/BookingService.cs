using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class BookingService(
        IBookingRepository bookingRepo,
        IBookingLockRepository bookingLockRepo,
        IEventService eventService,
        ICouponService couponService
    ) : IBookingService
    {
        private readonly IBookingRepository _bookingRepo = bookingRepo;
        private readonly IBookingLockRepository _bookingLockRepo = bookingLockRepo;
        private readonly IEventService _eventService = eventService;
        private readonly ICouponService _couponService = couponService;

        private static readonly TimeSpan BookingExpiry = TimeSpan.FromMinutes(15);
        private static readonly TimeSpan LockExpiry = TimeSpan.FromMinutes(15);

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
    }
}
