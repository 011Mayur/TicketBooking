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
            string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim is null)
                return Unauthorized();
            int userId = int.Parse(userIdClaim);

            try
            {
                CreatePaymentOrderResponse response = await _paymentService.CreatePaymentOrderAsync(
                    request.BookingId,
                    userId,
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
            string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim is null)
                return Unauthorized();
            int userId = int.Parse(userIdClaim);

            PaymentVerificationResponse response = await _paymentService.VerifyPaymentAsync(
                request,
                userId
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

   
    }
}
