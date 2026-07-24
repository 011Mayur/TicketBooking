using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Model.DTO
{
    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = ValidationMessage.RequiredEmail)]
        [EmailAddress(ErrorMessage = ValidationMessage.EmailValidationMessage)]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        [Required(ErrorMessage = ValidationMessage.TokenRequired)]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = ValidationMessage.PasswordRequired)]
        [MinLength(8, ErrorMessage = ValidationMessage.PasswordMinLength)]
        [MaxLength(15, ErrorMessage = ValidationMessage.PasswordMaxLength)]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$",
            ErrorMessage = ValidationMessage.PasswordValidation
        )]
        public string NewPassword { get; set; } = string.Empty;
    }
}
