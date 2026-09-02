using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Repository.Repository.Interface
{
    public interface IBookingRepository
    {
        Task<BookingResponseDto?> GetBookingByIdAsync(int id);

        Task UpdateBookingPaymentAsync(
            int userId,
            int bookingId,
            string razorpayOrderId,
            string razorpayPaymentId,
            BookingStatus status
        );

        Task<BookingResponseDto?> GetBookingByOrderIdAsync(string razorpayOrderId);
        Task RestoreSeatsAsync(int eventId, int quantity);

        Task MarkCouponUsed(int bookingId);
        Task<List<EventDiscountCouponDto>> GetEventCouponsAsync(int eventId, int usedId);

        Task<EventForPaymentSummary?> GetEventForPaymentSummaryByIdAsync(int eventId);

        Task<IEnumerable<BookingSummaryDto>> GetMyBookingsAsync(int userId);

        Task SetRazorpayOrderIdAsync(int bookingId, int usedId, string razorpayOrderId);

        Task<List<int>> GetExpiredPendingBookingIdsAsync();


        Task UpdateRazorpayPaymentIdAsync(int bookingId, string razorpayPaymentId);

        Task UpdateBookingStatusAsync(int bookingId, BookingStatus status);

        Task<bool> ValidateSeatsAvailableAsync(int eventId, int quantity);
        Task<BookingCreationResult> CreateBookingAsync(
            BookingCreateDto dto,
            BookingStatus status = BookingStatus.Pending
        );

        Task<BookingWithLockDto?> GetBookingWithLockAsync(int bookingId, int userId);

        Task<BookingCreationResult> CreateBookingAndMarkCouponAsync(
            BookingCreateDto dto,
            BookingStatus status
        );
    }
}
