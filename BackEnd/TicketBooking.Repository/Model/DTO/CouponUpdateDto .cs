using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TicketBooking.Repository.Model.DTO
{
    public class CouponUpdateDto : CouponCreateDto
    {
          [Required]
        public int Id { get; set; }
     
    }
}