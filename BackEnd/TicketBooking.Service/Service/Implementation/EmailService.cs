using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class EmailService(IConfiguration configuration) : IEmailService
    {
        private readonly IConfiguration _configuration = configuration;

        public async Task SendAsync(string toEmail, string subject, string body)
        {
            IConfiguration smtpSetting = _configuration.GetSection("smtpSettings");
            string Host =
                smtpSetting["Host"]
                ?? throw new InvalidOperationException("Host Is Not Configured");
            string? User =
                smtpSetting["User"]
                ?? throw new InvalidOperationException("User Is Not Configured");
            string? Password =
                smtpSetting["Password"]
                ?? throw new InvalidOperationException("Password Is Not Configured");
            int Port = int.Parse(
                smtpSetting["Port"] ?? throw new InvalidOperationException("Port Is Not Configured")
            );
            string from =
                smtpSetting["From"]
                ?? throw new InvalidOperationException("From Is Not Configured");

            using SmtpClient smtpClient = new(Host, Port)
            {
                Credentials = new NetworkCredential(User, Password),
                EnableSsl = true,
            };

            using MailMessage message = new(from: from, to: toEmail, subject: subject, body: body);

            await smtpClient.SendMailAsync(message);
        }
    }
}
