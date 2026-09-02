using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;
using TicketBooking.WebApi.Constant;

namespace TicketBooking.WebApi.Controller
{
    [ApiController]
    [Route("api/bookings")]
    [Authorize]
    public class BookingController(IBookingService bookingService, ICouponService couponService)
        : BaseController
    {
        private readonly IBookingService _bookingService = bookingService;
        private readonly ICouponService _couponService = couponService;

        [HttpPost("validate-checkout")]
        public async Task<IActionResult> ValidateCheckout([FromBody] CreateBookingRequestDto dto)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            await _bookingService.ValidateAndCheckoutAsync(userId, dto);
            return Success(true, "Checkout validation successful");
        }

        [HttpGet("get-booking/{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            BookingResponseDto order = await _bookingService.GetBookingByIdAsync(id, userId);
            return Success(order, ApiMessage.OrderFetched);
        }

        [HttpPost("apply-coupon")]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status422UnprocessableEntity)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<CouponValidationDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ApplyCoupon([FromBody] ApplyCouponRequest request)
        {
            string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim is null)
                return Unauthorized();
            int userId = int.Parse(userIdClaim);

            CouponValidationDto result = await _couponService.ValidateCouponAsync(
                request.Code,
                request.EventId,
                userId
            );

            return Success(result, ApiMessage.CouponApplied);
        }

        [HttpGet("get-coupons/{id}")]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status422UnprocessableEntity)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<EventDiscountCouponDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCoupons(int id)
        {
            string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim is null)
                return Unauthorized();
            int userId = int.Parse(userIdClaim);

            List<EventDiscountCouponDto> result = await _bookingService.GetEventCouponsAsync(
                id,
                userId
            );

            return Success(result, ApiMessage.CouponFetched);
        }

        [HttpGet("get-event/{id}")]
        public async Task<IActionResult> GetEvent(int id)
        {
            EventForPaymentSummary? order =
                await _bookingService.GetEventForPaymentSummaryByIdAsync(id);
            return Success(order, ApiMessage.EventFetched);
        }

        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            int userId = GetCurrentUserId();
            IEnumerable<BookingSummaryDto>? bookings = await _bookingService.GetMyBookingsAsync(
                userId
            );
            return Success(bookings, "Bookings fetched successfully");
        }

        private int GetCurrentUserId()
        {
            string? claim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException(ExceptionMessage.UserIdClaimMissing);
            return int.Parse(claim);
        }

        // [HttpPost("cancel/{id}")]
        // public async Task<IActionResult> CancelBooking(int id)
        // {
        //     int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        //     bool released = await _bookingService.ReleaseBookingAsync(id, userId);
        //     return Success(released, released ? "Booking cancelled" : "Booking already resolved");
        // }

        // [HttpPost("release/{id}")]
        // public async Task<IActionResult> ReleaseBooking(
        //     int id,
        //     [FromBody] ReleaseBookingRequest request
        // )
        // {
        //     int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        //     bool released = await _bookingService.ReleaseBookingAsync(id, userId, request.Status);
        //     return Success(released, $"Booking released with status: {request.Status}");
        // }

        [HttpGet("ticket-pdf/{id}")]
        public async Task<IActionResult> GetTicketPdf(int id)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            byte[] pdfBytes = await _bookingService.GenerateTicketPdfAsync(id, userId);
            
            return File(pdfBytes, "application/pdf", $"ticket-{id}.pdf");
        }
    }
}
