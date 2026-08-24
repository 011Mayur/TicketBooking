using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using TicketBooking.Repository.Common;

namespace TicketBooking.Repository.Model.DTO
{
    public class CouponCreateDto
    {
        [Required, MaxLength(ResonanceConstant.CoupenCodeMaxLength)]
        public string Code { get; set; } = string.Empty;

        [Required, Range(1, 100, ErrorMessage = ValidationMessage.DiscountPercentageValidation)]
        public decimal DiscountPercentage { get; set; }

        [Required]
        public DateTime ExpiryDate { get; set; }

        public required bool IsActive { get; set; } 
        
    }
}
