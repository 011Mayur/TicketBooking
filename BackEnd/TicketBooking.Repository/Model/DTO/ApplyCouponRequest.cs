using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TicketBooking.Repository.Model.DTO
{
    public class ApplyCouponRequest
    {
           public required string Code { get; set; }
            public required int EventId { get; set; }
    }
}