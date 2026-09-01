using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TicketBooking.Repository.Entity;

namespace TicketBooking.Repository.Repository.Interface
{
    public interface IBookingLockRepository
    {
        Task<BookingLock> CreateBookingLockAsync(
            int eventId,
            int userId,
            int quantity,
            string razorpayOrderId,
            DateTime expiresAt,
            decimal unitPrice,
            decimal subTotal,
            decimal? bulkDiscountPercentage,
            decimal? bulkDiscountAmount,
            int? couponId,
            string? couponCode,
            decimal? couponDiscountPercentage,
            decimal? couponDiscountAmount,
            decimal finalAmount,
            string discountType
        );

        Task<BookingLock?> GetLockByOrderIdAsync(string razorpayOrderId);

        Task<List<BookingLock>> GetActiveLocksByEventIdAsync(int eventId);

        Task<bool> DeleteLockAsync(string razorpayOrderId);

        Task<int> DeleteExpiredLocksAsync();

        Task<int> GetTotalLockedQuantityAsync(int eventId);

        Task DeleteExistingLockForUserAsync(int userId, int eventId);
    }
}
