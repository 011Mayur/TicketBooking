using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TicketBooking.Repository.Common
{
    public class ValidationMessage
    {
        public const string RequiredEmail = "Email Is required";

        public const string ReuiredPassword = "Password is required";

        public const string EmailMaxLengthValidationMessage = "Email Can't Exceed 320 Characters";

        public const string EmailValidationMessage = "Enter Valid Emaiil Address";

        public const string FirstNameRequired = $"FirstName is Required";

        public const string LastNameRequired = $"LastName is Required";
        public const string MobileMaxLengthValidationMessage =
            "Mobile Number Can't Exceed 10 Digits";

        public const string MobileValidationMessage = "Enter Valid Mobile NUmber";

        public const string MobileNumberRequired = "Mobile Number is required";
        public const string DateOfBirthRequired = "Birth Date is required";
        public const string GenderRequired = "Gender is required";
        public const string RoleRequired = "Role Number is required";

        public const string PasswordRequired = "Password is required";

        public const string TokenRequired = "Token is required";
        public const string PasswordMinLength = "Password  Must Containes atleast 8 characters";

        public const string PasswordMaxLength = "Password Must Not Exceed 15 characters";
        public const string PasswordValidation =
            "Password Must contains atleast one Capital Latter,small Latter,one digit and one Special chracters";

        public const string TicketPriceRangeValidation = "Ticket price must be greater than 0.";

        public const string TotalSeatsRangeValidation = "Total seats must be at least 1.";

        public const string DiscountPercentageValidation = "Discount percentage must be between 1 and 100.";

        public const string EventTimeRangeValidation = "Time had Invalid Format";
    }
}
