using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class JwtService(IConfiguration config) : IJwtService
    {
        private readonly IConfiguration _config = config;

        public string GenerateToken(UserLoginResponseDto user)
        {
            IConfigurationSection jwt = _config.GetSection("Jwt");
            string key = GetRequiredConfig<string>(jwt, "Key");
            string issuer = GetRequiredConfig<string>(jwt, "Issuer");
            string audience = GetRequiredConfig<string>(jwt, "Audience");
            int expiryMinutes = GetRequiredConfig<int>(jwt, "AccessTokenExpiryMinutes");

            List<Claim> claims =
            [
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(ClaimTypes.Role, user.Role.ToString()),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            ];

            SymmetricSecurityKey signingKey = new(Encoding.UTF8.GetBytes(key));
            SigningCredentials creds = new(signingKey, SecurityAlgorithms.HmacSha256);

            JwtSecurityToken token = new(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            byte[] randomBytes = new byte[64];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes);
        }

        public DateTime GetTokenExpiryTime()
        {
            IConfigurationSection jwt = _config.GetSection("Jwt");
            int refreshTokenExpiryDays = GetRequiredConfig<int>(jwt, "RefreshTokenExpiryDays");

            return DateTime.UtcNow.AddDays(refreshTokenExpiryDays);
        }

        private static T GetRequiredConfig<T>(IConfigurationSection section, string key)
        {
            T? value =
                section.GetValue<T>(key)
                ?? throw new ArgumentException(ExceptionMessage.KeyNotConfigured(key));
            if (typeof(T) == typeof(string) && string.IsNullOrWhiteSpace(value as string))
            {
                throw new ArgumentException(ExceptionMessage.KeyNotConfigured(key));
            }

            return value;
        }
    }
}
