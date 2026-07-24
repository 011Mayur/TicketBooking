using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class JwtService(IConfiguration config) : IJwtService
    {
        private readonly IConfiguration _config = config;

        public string GenerateToken(UserLoginResponseDto user)
        {
            var jwt = _config.GetSection("Jwt");
            string key =
                jwt["Key"]
                ?? throw new InvalidOperationException("Jwt:Key missing in configuration.");
            string issuer =
                jwt["Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer missing.");
            string audience =
                jwt["Audience"] ?? throw new InvalidOperationException("Jwt:Audience missing.");
            int expiryMinutes = int.TryParse(jwt["ExpiryMinutes"], out int m) ? m : 60;

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
    }
}
