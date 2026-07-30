namespace TicketBooking.Repository.Common
{
    public class ExceptionMessage
    {
        public static readonly string MinimumAge = $"You Must Be {Constant.MinimumAge} Year Old";

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

        #region config

        public static string KeyNotConfigured(string key) =>
            $"SMTP {key} is not configured or is empty";

        #endregion
    }
}
