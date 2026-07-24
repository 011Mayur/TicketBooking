namespace TicketBooking.Service.Service.Interface
{
    public interface IEmailService
    {
        Task SendAsync(string toEmail, string subject, string body);
    }
}
