using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Service.Service.Interface
{
    public interface IPaymentService
    {
        Task<CreatePaymentOrderResponse> CreatePaymentOrderAsync(
            int bookingId,
            int userId,
            CreateBookingRequestDto bookingData
        );
        Task<PaymentVerificationResponse> VerifyPaymentAsync(
            VerifyPaymentRequest request,
            int userId
        );

        Task<CheckPaymentAttemptResponse> CheckPaymentAttemptAsync(string orderId);

    
    }
}
