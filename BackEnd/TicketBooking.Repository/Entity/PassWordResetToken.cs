using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Org.BouncyCastle.Ocsp;

namespace TicketBooking.Repository.Entity
{
    public class PassWordResetToken
    {
        [Key]
        public int Id { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public required int UserId { get; set; }

        [Required]
        public required DateTime ExpiresAt { get; set; }

        [Required]
        public required bool IsUsed { get; set; } = false;

        [Required]
        [MaxLength(64)]
        public required string TokenHash { get; set; }
    }
}
