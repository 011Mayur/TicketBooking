using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TicketBooking.WebApi.Constant
{
    public class ApiMessage
    {
        public const string InvalidEmailPassword = "Invalid email or password.";
        public const string LoginSuccessful="Login successful.";
        public const string LogOutSuccessful="Logged out successfully.";

        public const string RestLinkSent = "If that email is registered, a reset link has been sent.";

        public const string InvalidResetLink = "This reset link is invalid or has expired.";

        public const string PasswordReset ="Password has been reset. You can now log in.";
    }
}
