using System.ComponentModel.DataAnnotations.Schema;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Model.DTO
{
    public class UserLoginResponseDto
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("first_name")]
        public string FirstName { get; set; } = string.Empty;

        [Column("last_name")]
        public string LastName { get; set; } = string.Empty;

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [Column("role")]
        public Role Role { get; set; }
    }
}
