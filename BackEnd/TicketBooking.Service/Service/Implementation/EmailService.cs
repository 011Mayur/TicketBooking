using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using TicketBooking.Repository.Common;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class EmailService(IConfiguration configuration) : IEmailService
    {
        private readonly IConfiguration _configuration = configuration;

        public async Task SendAsync(string toEmail, string subject, string body)
        {
            IConfigurationSection smtpSetting = _configuration.GetSection("smtpSettings");
            string host = GetRequiredConfig(smtpSetting, "Host");
            string? user = GetRequiredConfig(smtpSetting, "User");
            string? password = GetRequiredConfig(smtpSetting, "Password");
            int port = int.Parse(GetRequiredConfig(smtpSetting, "Port"));
            string from = GetRequiredConfig(smtpSetting, "from");

            using SmtpClient smtpClient = new(host, port)
            {
                Credentials = new NetworkCredential(user, password),
                EnableSsl = true,
            };

            using MailMessage message = new(from: from, to: toEmail, subject: subject, body: body);

            await smtpClient.SendMailAsync(message);
        }

        private static string GetRequiredConfig(IConfigurationSection section, string key)
        {
            string? value = section[key];

            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException(ExceptionMessage.KeyNotConfigured(key));

            return value;
        }
    }
}
