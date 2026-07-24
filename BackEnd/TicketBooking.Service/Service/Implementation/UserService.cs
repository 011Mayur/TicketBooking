using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class UserService(
        IUserRepository userRepo,
        IEmailService emailService,
        IConfiguration configuration
    ) : IUserService
    {
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IEmailService _emailService = emailService;

        private readonly IConfiguration _configuration = configuration;

        public async Task<int> AddUserAsync(UserRegisterDto user)
        {
            user.PasswordHash = PasswordHash(user.PasswordHash);
            int userId = await _userRepo.AddUserAsync(user);

            return userId;
        }

        public async Task<UserLoginResponseDto?> ValidateUserAsync(UserLoginDto login)
        {
            UserLoginResponseDto? user = await _userRepo.GetUserByEmail(login.Email);

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
                ?? throw new InvalidOperationException("FrontEndUrl Not configured");

            if (user is null)
                return;

            string rawToken = GenerateRawToken();
            string tokenHash = Hash(rawToken);
            DateTime expiresAt = DateTime.UtcNow.AddMinutes(30);

            await _userRepo.CreateResetTokenAsync(user.Id, tokenHash, expiresAt);

            string link = $"{frontendBaseUrl}/reset-password?token={rawToken}";
            string body =
                $"Click the link below to reset your password. This link expires in 30 minutes.\n\n{link}\n\nIf you didn't request this, ignore this email.";

            await _emailService.SendAsync(user.Email, "Reset your password", body);
        }

        public async Task<bool> ResetPasswordAsync(string rawToken, string newPassword)
        {
            string tokenHash = Hash(rawToken);
            (int UserId, DateTime ExpiresAt, bool Used)? record = await _userRepo.GetValidResetTokenAsync(tokenHash);
DateTime now = DateTime.UtcNow;
            if (record is null || record.Value.Used || record.Value.ExpiresAt < now)
                return false;

            string newHash = PasswordHash(newPassword);
            await _userRepo.UpdatePasswordAsync(record.Value.UserId, newHash);
            await _userRepo.MarkTokenUsedAsync(tokenHash);

            return true;
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
    }
}
