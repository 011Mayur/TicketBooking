using System.Security.Cryptography.X509Certificates;
using TicketBooking.Repository.Common;

namespace TicketBooking.WebApi.DTO;

public class CurrentUserResponse
{
    public int? Id { get; set; }
    public string? Email { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }
    public string? Role { get; set; }
}
