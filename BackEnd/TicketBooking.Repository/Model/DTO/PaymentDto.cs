using System.ComponentModel.DataAnnotations;

namespace TicketBooking.Repository.Model.DTO
{
    public class CreatePaymentOrderRequest
    {
        public required int BookingId { get; set; }

        public required CreateBookingRequestDto BookingData { get; set; }
    }

    public class CreatePaymentOrderResponse
    {
        public required string OrderId { get; set; }
        public required int BookingId { get; set; }
        public required decimal Amount { get; set; }
        public required string Currency { get; set; }
        public required string RazorpayKeyId { get; set; }
    }

    public class VerifyPaymentRequest
    {
        public int BookingId { get; set; }

        [Required]
        public required string RazorpayOrderId { get; set; }

        [Required]
        public required string RazorpayPaymentId { get; set; }

        [Required]
        public required string RazorpaySignature { get; set; }
    }

    public class PaymentVerificationResponse
    {
        public int? BookingId { get; set; }
        public required bool IsValid { get; set; }
        public required string Message { get; set; }
    }

    public class RazorpayWebhookPayload
    {
        public string? Id { get; set; }
        public string? Event { get; set; }
        public Dictionary<string, object>? Payload { get; set; }
    }

    public class RazorpayPaymentEntity
    {
        public string? Id { get; set; }
        public string? OrderId { get; set; }
        public string? Status { get; set; }
        public int Amount { get; set; }
        public string? Method { get; set; }
        public Dictionary<string, object>? VPA { get; set; }
    }
}
