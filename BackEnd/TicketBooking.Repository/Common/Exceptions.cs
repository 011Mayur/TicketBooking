using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TicketBooking.Repository.Common
{
    public class DuplicateFieldException(string field, string message) : Exception(message)
    {
        public string Field { get; } = field;
    }
}
