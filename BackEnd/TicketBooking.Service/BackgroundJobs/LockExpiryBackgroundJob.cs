using Microsoft.Extensions.Logging;
using Quartz;
using TicketBooking.Repository.Repository.Interface;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.BackgroundJobs
{
    [DisallowConcurrentExecution]
    public class LockExpiryBackgroundJob(
        IBookingLockRepository bookingLockRepo,
        IBookingService bookingService,
        ILogger<LockExpiryBackgroundJob> logger
    ) : IJob
    {
        private readonly IBookingLockRepository _bookingLockRepo = bookingLockRepo;
        private readonly IBookingService _bookingService = bookingService;
        private readonly ILogger<LockExpiryBackgroundJob> _logger = logger;

        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                _logger.LogInformation("Starting lock expiry background job...");

                int expiredLocksCount = await _bookingLockRepo.DeleteExpiredLocksAsync();
                _logger.LogInformation($"Deleted {expiredLocksCount} expired locks");

                await _bookingService.ExpireStaleBookingsAsync();
                _logger.LogInformation("Expired stale bookings");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in lock expiry background job: {ex.Message}");
            }
        }
    }
}
