using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Model.DTO
{
    public class UserLoginRequestDto
    {
        [Required(ErrorMessage = ValidationMessage.RequiredEmail)]
        [MaxLength(ErrorMessage = ValidationMessage.EmailMaxLengthValidationMessage)]
        [RegularExpression(
            @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
            ErrorMessage = ValidationMessage.EmailValidationMessage
        )]
        public required string Email { get; set; }

       
    }
}
