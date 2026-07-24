using System.ComponentModel.DataAnnotations;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Entity
{
    public class User : BaseEntity
    {
        [Required]
        [MaxLength(Constant.NameMaxLength)]
        public required string FirstName { get; set; }

        [Required]
        [MaxLength(Constant.NameMaxLength)]
        public required string LastName { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        [Required]
        public required Gender Gender { get; set; }

        [Required]
        public required Role Role { get; set; }

        [Required]
        public required DateTime DateOfBirth { get; set; }

        [Required]
        [MaxLength(
            Constant.MobileNumberLength,
            ErrorMessage = ValidationMessage.MobileMaxLengthValidationMessage
        )]
        [RegularExpression(
            @"^[6-9]\d{9}$",
            ErrorMessage = ValidationMessage.MobileValidationMessage
        )]
        public required string MobileNumber { get; set; }

        [Required]
        [MaxLength(
            Constant.EmailMaxLength,
            ErrorMessage = ValidationMessage.EmailMaxLengthValidationMessage
        )]
        [RegularExpression(
            @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
            ErrorMessage = ValidationMessage.EmailValidationMessage
        )]
        public required string Email { get; set; }
    }
}
