
using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Model.DTO
{
    public class UserLoginDto
    {
        [Required(ErrorMessage = ValidationMessage.RequiredEmail)]
        [MaxLength(
            Constant.EmailMaxLength,
            ErrorMessage = ValidationMessage.EmailMaxLengthValidationMessage
        )]
        [RegularExpression(
            @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
            ErrorMessage = ValidationMessage.EmailValidationMessage
        )]
        public required string Email { get; set; }

        [Required(ErrorMessage = ValidationMessage.PasswordRequired)]
        public string Password { get; set; } = string.Empty;
    }
}
