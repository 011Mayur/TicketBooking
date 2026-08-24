using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Razorpay.Api;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class PaymentService(
        IBookingRepository bookingRepo,
        IBookingLockRepository bookingLockRepo,
        IBookingService bookingService,
        IEventService eventService,
        IConfiguration config,
        ILogger<PaymentService> logger,
        ICouponService couponService
    ) : IPaymentService
    {
        private readonly IBookingRepository _bookingRepo = bookingRepo;
        private readonly IBookingLockRepository _bookingLockRepo = bookingLockRepo;
        private readonly IBookingService _bookingService = bookingService;
        private readonly IEventService _eventService = eventService;
        private readonly ILogger<PaymentService> _logger = logger;

        private readonly ICouponService _couponService = couponService;

        private readonly string _razorpayKeyId =
            config["Razorpay:KeyId"]
            ?? throw new InvalidOperationException("Razorpay KeyId not configured");
        private readonly string _razorpayKeySecret =
            config["Razorpay:KeySecret"]
            ?? throw new InvalidOperationException("Razorpay KeySecret not configured");

        private static readonly TimeSpan LockExpiry = TimeSpan.FromMinutes(15);

        private RazorpayClient GetRazorpayClient() => new(_razorpayKeyId, _razorpayKeySecret);

        /// <summary>
        /// NEW FLOW: Create payment order + booking lock
        /// Called when user navigates to payment page
        /// </summary>
        public async Task<CreatePaymentOrderResponse> CreatePaymentOrderAsync(
            int bookingId,
            int userId,
            CreateBookingRequestDto bookingData
        )
        {
            EventForBooking evt = await _eventService.GetEventForBooking(bookingData.EventId);

            int totalLocked = await _bookingLockRepo.GetTotalLockedQuantityAsync(
                bookingData.EventId
            );
            int actualAvailable = evt.AvailableSeats - totalLocked;

            if (actualAvailable < bookingData.Quantity)
            {
                throw new BusinessRuleException(
                    $"Only {actualAvailable} seats available. {bookingData.Quantity} requested."
                );
            }

            try
            {
                RazorpayClient client = GetRazorpayClient();

                decimal unitPrice = evt.TicketPrice;
                decimal subTotal = unitPrice * bookingData.Quantity;
                decimal discount = 0;
                decimal? bulkDiscountPercentage = null,
                    bulkDiscountAmount = null;
                decimal? couponDiscountPercentage = null,
                    couponDiscountAmount = null;
                int? couponId = null;

                switch (bookingData.DiscountType)
                {
                    case BookingDiscountType.Bulk:
                        if (
                            evt.BulkTicketForDiscount.HasValue
                            && evt.DiscountPercentage.HasValue
                            && bookingData.Quantity >= evt.BulkTicketForDiscount.Value
                        )
                        {
                            bulkDiscountPercentage = evt.DiscountPercentage.Value;
                            bulkDiscountAmount = (subTotal * bulkDiscountPercentage.Value) / 100m;
                            discount = bulkDiscountAmount.Value;
                        }
                        break;

                    case BookingDiscountType.Coupon:
                        if (!string.IsNullOrWhiteSpace(bookingData.CouponCode))
                        {
                            var coupon = await _couponService.ValidateCouponAsync(
                                bookingData.CouponCode,
                                bookingData.EventId,
                                userId
                            );
                            couponId = coupon.Id;
                            couponDiscountPercentage = coupon.DiscountPercentage;
                            couponDiscountAmount =
                                (subTotal * couponDiscountPercentage.Value) / 100m;
                            discount = couponDiscountAmount.Value;
                        }
                        break;
                }

                decimal finalAmount = subTotal - discount;

                Dictionary<string, object> orderOptions = new()
                {
                    { "amount", (int)(finalAmount * 100) },
                    { "currency", "INR" },
                    { "receipt", $"booking_{userId}_{DateTime.UtcNow.Ticks}" },
                    { "partial_payment", false },
                };

                Order order = client.Order.Create(orderOptions);
                string razorpayOrderId = order["id"].ToString();

                // ✅ Lock only — no booking row, no seat decrement here
                await _bookingLockRepo.CreateBookingLockAsync(
                    eventId: bookingData.EventId,
                    userId: userId,
                    quantity: bookingData.Quantity,
                    razorpayOrderId: razorpayOrderId,
                    expiresAt: DateTime.UtcNow.Add(LockExpiry),
                    unitPrice: unitPrice,
                    subTotal: subTotal,
                    bulkDiscountPercentage: bulkDiscountPercentage,
                    bulkDiscountAmount: bulkDiscountAmount,
                    couponId: couponId,
                    couponCode: bookingData.CouponCode,
                    couponDiscountPercentage: couponDiscountPercentage,
                    couponDiscountAmount: couponDiscountAmount,
                    finalAmount: finalAmount,
                    discountType: bookingData.DiscountType.ToString()
                );

                _logger.LogInformation(
                    $"Lock created for order {razorpayOrderId}, no booking row yet"
                );

                return new CreatePaymentOrderResponse
                {
                    OrderId = razorpayOrderId,
                    BookingId = 0, // no real booking exists until payment is verified
                    Amount = finalAmount,
                    Currency = "INR",
                    RazorpayKeyId = _razorpayKeyId,
                };
            }
            catch (BusinessRuleException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Payment order creation failed: {ex.Message}");
                throw new BusinessRuleException("Failed to create payment order");
            }
        }

        /// <summary>
        /// NEW FLOW: Verify payment + update booking status to Paid
        /// </summary>
        public async Task<PaymentVerificationResponse> VerifyPaymentAsync(
            VerifyPaymentRequest request,
            int userId
        )
        {
            try
            {
                bool isSignatureValid = VerifyRazorpaySignature(
                    request.RazorpayOrderId,
                    request.RazorpayPaymentId,
                    request.RazorpaySignature
                );

                if (!isSignatureValid)
                {
                    await _bookingLockRepo.DeleteLockAsync(request.RazorpayOrderId);
                    return new PaymentVerificationResponse
                    {
                        IsValid = false,
                        Message = "Payment verification failed",
                    };
                }

                RazorpayClient client = GetRazorpayClient();
                Payment payment = client.Payment.Fetch(request.RazorpayPaymentId);

                if (payment["status"].ToString() != "captured")
                {
                    await _bookingLockRepo.DeleteLockAsync(request.RazorpayOrderId);
                    return new PaymentVerificationResponse
                    {
                        IsValid = false,
                        Message = "Payment not in captured state",
                    };
                }

                var bookingLock = await _bookingLockRepo.GetLockByOrderIdAsync(
                    request.RazorpayOrderId
                );
                if (bookingLock == null)
                    return new PaymentVerificationResponse
                    {
                        IsValid = false,
                        Message = "Booking lock not found or expired",
                    };

                EventForBooking evt = await _eventService.GetEventForBooking(bookingLock.EventId);
                int totalLocked = await _bookingLockRepo.GetTotalLockedQuantityAsync(
                    bookingLock.EventId
                );
                // Exclude THIS user's lock from the total — their seats are already reserved
                int otherLocked = totalLocked - bookingLock.Quantity;
                int actualAvailable = evt.AvailableSeats - otherLocked;

                if (actualAvailable < bookingLock.Quantity)
                {
                    _logger.LogWarning(
                        $"Seats not available for booking lock {request.RazorpayOrderId}"
                    );
                    await _bookingLockRepo.DeleteLockAsync(request.RazorpayOrderId);
                    // Payment was captured but seats vanished — needs manual refund handling; log loudly.
                    _logger.LogError(
                        $"Captured payment {request.RazorpayPaymentId} has no seats to fulfil — refund required."
                    );
                    return new PaymentVerificationResponse
                    {
                        IsValid = false,
                        Message = "Seats not available. Contact support for a refund.",
                    };
                }

                var bookingDto = new BookingCreateDto
                {
                    UserId = bookingLock.UserId,
                    EventId = bookingLock.EventId,
                    Quantity = bookingLock.Quantity,
                    UnitPrice = bookingLock.UnitPrice,
                    SubTotal = bookingLock.SubTotal,
                    BulkDiscountPercentage = bookingLock.BulkDiscountPercentage,
                    BulkDiscountAmount = bookingLock.BulkDiscountAmount,
                    CouponId = bookingLock.CouponId,
                    CouponCode = bookingLock.CouponCode,
                    CouponDiscountPercentage = bookingLock.CouponDiscountPercentage,
                    CouponDiscountAmount = bookingLock.CouponDiscountAmount,
                    FinalAmount = bookingLock.FinalAmount,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                    DiscountType = Enum.Parse<BookingDiscountType>(bookingLock.DiscountType),
                };

                var bookingResult = await _bookingRepo.CreateBookingAsync(
                    bookingDto,
                    BookingStatus.Paid
                );

                if (!bookingResult.BookingId.HasValue)
                {
                    _logger.LogError(
                        $"Booking creation failed post-payment for order {request.RazorpayOrderId}, payment {request.RazorpayPaymentId} — refund required."
                    );
                    await _bookingLockRepo.DeleteLockAsync(request.RazorpayOrderId);
                    return new PaymentVerificationResponse
                    {
                        IsValid = false,
                        Message = "Booking failed after payment. Contact support for a refund.",
                    };
                }

                int newBookingId = bookingResult.BookingId.Value;

                await _bookingRepo.UpdateBookingPaymentAsync(
                    bookingLock.UserId,
                    newBookingId,
                    request.RazorpayOrderId,
                    request.RazorpayPaymentId,
                    BookingStatus.Paid
                );

                if (bookingLock.CouponId.HasValue)
                    await _bookingRepo.MarkCouponUsed(newBookingId);

                await _bookingLockRepo.DeleteLockAsync(request.RazorpayOrderId);

                _logger.LogInformation(
                    $"Booking #{newBookingId} created as Paid for order {request.RazorpayOrderId}"
                );

                return new PaymentVerificationResponse
                {
                    IsValid = true,
                    Message = "Payment verified and booking confirmed successfully",
                    BookingId = newBookingId, // frontend needs this now — see DTO change below
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Payment verification error: {ex.Message}");
                try
                {
                    await _bookingLockRepo.DeleteLockAsync(request.RazorpayOrderId);
                }
                catch { }
                return new PaymentVerificationResponse
                {
                    IsValid = false,
                    Message = "Error verifying payment",
                };
            }
        }

        /// <summary>
        /// Check if payment was attempted and mark booking as Failed if needed
        /// </summary>
        public async Task<CheckPaymentAttemptResponse> CheckPaymentAttemptAsync(string orderId)
        {
            try
            {
                RazorpayClient client = GetRazorpayClient();
                var payments = client.Payment.All(
                    new Dictionary<string, object> { { "order_id", orderId } }
                );

                bool paymentAttempted = payments.Count > 0;
                string? razorpayPaymentId = null;

                if (paymentAttempted && payments.Count > 0)
                {
                    razorpayPaymentId = payments[0]["id"].ToString();
                }

                // If no payment attempted, delete the lock
                if (!paymentAttempted)
                {
                    await _bookingLockRepo.DeleteLockAsync(orderId);
                    _logger.LogInformation($"Lock deleted for dismissed payment: {orderId}");
                }

                return new CheckPaymentAttemptResponse
                {
                    PaymentAttempted = paymentAttempted,
                    RazorpayPaymentId = razorpayPaymentId,
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error checking payment attempt: {ex.Message}");
                return new CheckPaymentAttemptResponse
                {
                    PaymentAttempted = false,
                    RazorpayPaymentId = null,
                };
            }
        }

        public async Task ReleaseBookingAsync(
            int bookingId,
            BookingStatus status,
            string? razorpayPaymentId,
            int userId
        )
        {
            var booking = await _bookingRepo.GetBookingByIdAsync(bookingId);

            if (booking is null || booking.UserId != userId)
                throw new ResourceNotFoundException("Booking not found");

            // Store payment ID if provided (for Failed status)
            if (!string.IsNullOrEmpty(razorpayPaymentId))
            {
                await _bookingRepo.UpdateRazorpayPaymentIdAsync(bookingId, razorpayPaymentId);
            }

            // Update booking status
            await _bookingRepo.UpdateBookingStatusAsync(bookingId, status);
        }

        private bool VerifyRazorpaySignature(string orderId, string paymentId, string signature)
        {
            string payload = $"{orderId}|{paymentId}";
            using HMACSHA256 hmac = new(Encoding.UTF8.GetBytes(_razorpayKeySecret));
            byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            string computedSignature = Convert.ToHexString(hash).ToLower();

            bool isValid = computedSignature.Equals(signature, StringComparison.OrdinalIgnoreCase);
            _logger.LogInformation($"Signature verification: {(isValid ? "Success" : "Failed")}");

            return isValid;
        }
    }
}
