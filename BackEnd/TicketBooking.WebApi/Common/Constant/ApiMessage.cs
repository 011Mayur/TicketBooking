using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TicketBooking.WebApi.Constant
{
    public class ApiMessage
    {
        public const string InvalidEmailPassword = "Invalid email or password.";
        public const string LoginSuccessful = "Login successful.";
        public const string LogOutSuccessful = "Logged out successfully.";

        public const string RestLinkSent =
            "If that email is registered, a reset link has been sent.";

        public const string InvalidResetLink = "This reset link is invalid or has expired.";

        public const string ImageUploaded = "Image uploaded successfully";

        public const string PasswordReset = "Password has been reset. You can now log in.";
        public static readonly string CurrentUserRetrive = "Current user retrieved successfully";

        public static readonly string EventFetched = "Events fetched successfully";

        public static readonly string EventTypeCreated = "EventType created successfully";
        public static readonly string EventTypeUpdated = "EventType updated successfully";

        public static readonly string EventTypeDeleted = "EventType deleted successfully";

        public static readonly string CategoryCreated = "Category created successfully";
        public static readonly string CategoryUpdated = "Category updated successfully";

        public static readonly string CategoryDeleted = "Category deleted successfully";

        public static readonly string OrderCreated = "Order created successfully";
        public static readonly string OrderFetched = "Order fetched successfully";

        public static readonly string CouponApplied = "Coupon applied successfully";
        public static readonly string CouponFetched = "Coupon Fetched successfully";
    }
}
