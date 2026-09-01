using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class UserService(
        IUserRepository userRepo,
        IEmailService emailService,
        IConfiguration configuration,
        IJwtService jwtService
    ) : IUserService
    {
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IEmailService _emailService = emailService;

        private readonly IConfiguration _configuration = configuration;
        private readonly IJwtService _jwtService = jwtService;

        public async Task<int> AddUserAsync(UserRegisterDto user)
        {
            if (!IsValidAge(user.DateOfBirth))
                throw new BusinessRuleException(ExceptionMessage.MinimumAge);
            user.PasswordHash = PasswordHash(user.PasswordHash);
            int userId = await _userRepo.AddUserAsync(user);

            return userId;
        }

        public async Task<UserLoginResponseDto?> ValidateUserAsync(UserLoginDto login)
        {
            UserLoginResponseDto? user = await _userRepo.GetUserByEmailAndRole(login.Email, login.Role);

            if (user is null)
                return null;

            bool isPasswordCorrect = BCrypt.Net.BCrypt.EnhancedVerify(
                login.Password,
                user.PasswordHash
            );

            return isPasswordCorrect ? user : null;
        }

        public async Task RequestPasswordResetAsync(string email)
        {
            UserLoginResponseDto? user = await _userRepo.GetUserByEmail(email);
            string frontendBaseUrl =
                _configuration.GetValue<string>("frontEndUrl")
                ?? throw new InvalidOperationException(ExceptionMessage.FrontEndUrlNotConfigured);

            if (user is null)
                return;

            string rawToken = GenerateRawToken();
            string tokenHash = Hash(rawToken);
            DateTime expiresAt = DateTime.UtcNow.AddMinutes(30);

            await _userRepo.CreateResetTokenAsync(user.Id, tokenHash, expiresAt);

            string link = $"{frontendBaseUrl}/reset-password?token={rawToken}&email={Uri.EscapeDataString(user.Email)}";
            string body = BuildResetEmailTemplate(user.Email, link);

            await _emailService.SendAsync(user.Email, "Reset your password — Resonance", body);
        }

        public async Task<bool> ResetPasswordAsync(string rawToken, string newPassword)
        {
            string tokenHash = Hash(rawToken);
            (int UserId, DateTime ExpiresAt, bool Used)? record =
                await _userRepo.GetValidResetTokenAsync(tokenHash);
            DateTime now = DateTime.UtcNow;
            if (record is null || record.Value.Used || record.Value.ExpiresAt < now)
                return false;

            string newHash = PasswordHash(newPassword);
            await _userRepo.UpdatePasswordAsync(record.Value.UserId, newHash);
            await _userRepo.MarkTokenUsedAsync(tokenHash);

            return true;
        }

        public async Task<string> CreateRefreshTokenAsync(int userId)
        {
            string refreshToken = _jwtService.GenerateRefreshToken();
            DateTime expiresAt = _jwtService.GetTokenExpiryTime();

            await _userRepo.CreateRefreshTokenAsync(userId, refreshToken, expiresAt);

            return refreshToken;
        }

        public async Task<RefreshTokenDto?> ValidateRefreshTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            RefreshTokenDto? dbToken = await _userRepo.GetRefreshTokenAsync(token);

            if (dbToken is null || dbToken.ExpiresAt < DateTime.UtcNow)
                return null;

            return dbToken;
        }

        public async Task DeleteRefreshTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return;

            await _userRepo.DeleteRefreshTokenAsync(token);
        }

        public async Task<UserLoginResponseDto?> GetUserByIdAsync(int userId)
        {
            return await _userRepo.GetUserByIdAsync(userId);
        }

        private static string PasswordHash(string PlainPassWord)
        {
            return BCrypt.Net.BCrypt.EnhancedHashPassword(PlainPassWord);
        }

        private static string GenerateRawToken()
        {
            byte[] bytes = RandomNumberGenerator.GetBytes(32);
            return Convert
                .ToBase64String(bytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }

        private static string Hash(string input)
        {
            byte[] bytes = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(input));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static bool IsValidAge(DateTime dateOfBirth)
        {
            DateTime today = DateTime.Today;

            int age = today.Year - dateOfBirth.Year;

            if (dateOfBirth.Date > today.AddYears(-age))
            {
                age--;
            }

            return age > 16;
        }

        private static string BuildResetEmailTemplate(string email, string resetLink)
        {
            return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <title>Reset Your Password</title>
</head>
<body style=""margin:0; padding:0; background-color:#f5f5f5; font-family: 'Segoe UI', Arial, Helvetica, sans-serif;"">

  <!-- Wrapper -->
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f5f5f5; padding:40px 0;"">
    <tr>
      <td align=""center"">

        <!-- Card -->
        <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08);"">

          <!-- Header -->
          <tr>
            <td style=""background-color:#4540e1; padding:28px 40px; text-align:center;"">
              <h1 style=""margin:0; font-size:22px; font-weight:700; color:#ffffff; letter-spacing:0.5px;"">Resonance</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style=""padding:36px 40px 20px 40px;"">
              <h2 style=""margin:0 0 8px 0; font-size:20px; font-weight:600; color:#333333;"">Reset your password</h2>
              <p style=""margin:0 0 24px 0; font-size:14px; color:#666666; line-height:1.6;"">
                We received a request to reset the password for the account associated with
                <strong style=""color:#333333;"">{email}</strong>.
                Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin:0 auto 24px auto;"">
                <tr>
                  <td style=""border-radius:6px; background-color:#4540e1; text-align:center;"">
                    <a href=""{resetLink}"" target=""_blank""
                       style=""display:inline-block; padding:12px 36px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:0.3px;"">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style=""margin:0 0 20px 0; font-size:13px; color:#999999; line-height:1.5;"">
                This link will expire in <strong style=""color:#666666;"">30 minutes</strong>.
                If you didn't request a password reset, you can safely ignore this email.
              </p>

              <!-- Fallback link -->
              <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""border-top:1px solid #eeeeee; padding-top:18px;"">
                <tr>
                  <td>
                    <p style=""margin:0 0 6px 0; font-size:12px; color:#999999;"">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style=""margin:0; font-size:12px; word-break:break-all;"">
                      <a href=""{resetLink}"" style=""color:#4540e1; text-decoration:none;"">{resetLink}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""padding:20px 40px 28px 40px; border-top:1px solid #eeeeee;"">
              <p style=""margin:0 0 4px 0; font-size:12px; color:#999999; text-align:center;"">
                &copy; {DateTime.UtcNow.Year} Resonance. All rights reserved.
              </p>
              <p style=""margin:0; font-size:11px; color:#cccccc; text-align:center;"">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Wrapper -->

</body>
</html>";
        }
    }
}
