namespace TicketBooking.Repository.Common
{
    public class ExceptionMessage
    {
        public static readonly string MinimumAge =
            $"You Must Be {ResonanceConstant.MinimumAge} Year Old";

        public static readonly string NoFile = "No file was uploaded.";

        public static string PosterImageSizeExceed(long size) =>
            $"Image must be smaller than {size}MB.";

        public static readonly string InvalidImagePosterExtension =
            "Only JPG,JPEG or PNG images are allowed.";

        public static readonly string InvalidImagePosterFormat =
            "File content does not match a valid image format.";

        public static string CloudinaryUploadFail(string message) =>
            $"Cloudinary upload failed: {message}";

        public static string CloudinaryDeleteFail(string message) =>
            $"Could Not Delete Image: {message}";

        public static readonly string PastEventData = "Event date cannot be in the past.";

        public static readonly string FutureExpiryDate = "Expiry date must be in the future.";
        public static readonly string DulicateCoupon = "A coupon with this code already exists.";

        public static string ResourceNotFound(int id, string resource) =>
            $"{resource} with id:{id} does not found";

        public static readonly string FailedDeleteCategory = "Failed to delete category";

        public static string KeyNotConfigured(string key) =>
            $"SMTP {key} is not configured or is empty";

        public static readonly string EventTypeDelete = "Failed to delete EventType";

        public static readonly string MinimumQuntity = "Quantity must be at least 1.";

        public static readonly string EventEnded =
            "This event has already ended. Booking is closed.";

        public static readonly string NotEnoughSeats = "Not enough seats available for this event.";

        public static readonly string BulkDiscountNotEligible =
            "Quantity does not meet the bulk discount threshold for this event.";
        public static readonly string CouponCodeRequired =
            "Coupon code is required when applying a coupon discount.";

        public static string CouponNotFound(string code) => $"No coupon found with code '{code}'.";

        public static readonly string CouponInactive = "This coupon is not currently active.";
        public static readonly string CouponExpired = "This coupon has expired.";
        public static readonly string CouponNotApplicableToEvent =
            "This coupon is not valid for this event.";
        public static readonly string CouponAlreadyUsed = "You have already used this coupon.";

        public static readonly string UserIdClaimMissing = "User id claim missing";
        public static readonly string FrontEndUrlNotConfigured = "FrontEndUrl Not configured";
        public static readonly string RazorpayKeyIdNotConfigured = "Razorpay KeyId not configured";
        public static readonly string RazorpayKeySecretNotConfigured = "Razorpay KeySecret not configured";
        public static readonly string FailedToCreatePaymentOrder = "Failed to create payment order";
        public static readonly string BookingNotFound = "Booking not found";
        public static readonly string ImageUrlNullOrEmpty = "Image URL cannot be null or empty.";
        public static readonly string InvalidCloudinaryUrl = "Invalid Cloudinary URL.";
        public static readonly string ConnectionStringNotFound = "Connection string not found.";
        public static readonly string RefreshTokenMissing = "Refresh token missing";
        public static readonly string RefreshTokenExpired = "Refresh token expired or invalid";
        public static readonly string UserNotFound = "User not found";
    }
}
