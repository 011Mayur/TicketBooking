using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.WebApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = nameof(Role.User))]
    public class PaymentController(IPaymentService paymentService) : BaseController
    {
        private readonly IPaymentService _paymentService = paymentService;

        [HttpPost("create-order")]
        public async Task<IActionResult> CreatePaymentOrder(
            [FromBody] CreatePaymentOrderRequest request
        )
        {
            int? userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (userId == null)
                return Unauthorized();

            try
            {
                CreatePaymentOrderResponse response = await _paymentService.CreatePaymentOrderAsync(
                    request.BookingId,
                    userId.Value,
                    request.BookingData
                );

                return Success(response, "Payment order created successfully. Seats locked.");
            }
            catch (BusinessRuleException ex)
            {
                return UnprocessableEntity(new { message = ex.Message });
            }
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentRequest request)
        {
            int? userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (userId == null)
                return Unauthorized();

            PaymentVerificationResponse response = await _paymentService.VerifyPaymentAsync(
                request,
                userId.Value
            );

            if (!response.IsValid)
                return BadRequest(response);

            return Success(response, response.Message);
        }

        [HttpGet("check-attempt/{orderId}")]
        public async Task<IActionResult> CheckPaymentAttempt(string orderId)
        {
            var result = await _paymentService.CheckPaymentAttemptAsync(orderId);
            return Success(result, "Payment check completed");
        }

        [HttpPost("release")]
        public async Task<IActionResult> ReleaseBooking([FromBody] ReleaseBookingRequest request)
        {
            int? userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (userId == null)
                return Unauthorized();

            await _paymentService.ReleaseBookingAsync(
                request.BookingId,
                request.Status,
                request.RazorpayPaymentId,
                userId.Value
            );

            return Success("Booking released successfully");
        }
    }
}
