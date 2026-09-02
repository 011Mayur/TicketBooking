using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Service.Service.Interface
{
    public interface IBookingService
    {
        Task<BookingResponseDto> GetBookingByIdAsync(int id, int currentUserId);

        Task<List<EventDiscountCouponDto>> GetEventCouponsAsync(int eventId, int userId);

        Task<EventForPaymentSummary?> GetEventForPaymentSummaryByIdAsync(int eventId);

        Task<IEnumerable<BookingSummaryDto>> GetMyBookingsAsync(int userId);

        Task ExpireStaleBookingsAsync();

  

        Task<bool> ValidateAndCheckoutAsync(int userId, CreateBookingRequestDto dto);
        Task<BookingResponseDto> CreateBookingOnPaymentAsync(
            int userId,
            int eventId,
            int quantity,
            BookingDiscountType discountType,
            string? couponCode,
            BookingStatus status
        );

        Task<byte[]> GenerateTicketPdfAsync(int bookingId, int userId);
    }
}
