using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Model.DTO;

public class UserRegisterDto
{
    [Required(ErrorMessage = ValidationMessage.FirstNameRequired)]
    public required string FirstName { get; set; }

    [Required(ErrorMessage = ValidationMessage.LastNameRequired)]
    public required string LastName { get; set; }

    [MaxLength(
        Constant.EmailMaxLength,
        ErrorMessage = ValidationMessage.EmailMaxLengthValidationMessage
    )]
    [RegularExpression(
        @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        ErrorMessage = ValidationMessage.EmailValidationMessage
    )]
    public required string Email { get; set; }

    [Required]
    [MaxLength(
        Constant.MobileNumberLength,
        ErrorMessage = ValidationMessage.MobileMaxLengthValidationMessage
    )]
    [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = ValidationMessage.MobileValidationMessage)]
    public required string MobileNumber { get; set; }

    [Required(ErrorMessage = ValidationMessage.DateOfBirthRequired)]
    public required DateTime DateOfBirth { get; set; }

    [Required(ErrorMessage = ValidationMessage.RoleRequired)]
    public required Role Role { get; set; } = Role.User;

    [Required(ErrorMessage = ValidationMessage.GenderRequired)]
    public required Gender Gender { get; set; }

    [Required(ErrorMessage = ValidationMessage.PasswordRequired)]
    [MinLength(8, ErrorMessage = ValidationMessage.PasswordMinLength)]
    [MaxLength(15, ErrorMessage = ValidationMessage.PasswordMaxLength)]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$",
        ErrorMessage = ValidationMessage.PasswordValidation
    )]
    [JsonPropertyName("password")]
    public required string PasswordHash { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
