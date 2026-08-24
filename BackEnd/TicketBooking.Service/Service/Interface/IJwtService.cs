using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Service.Service.Interface
{
    public interface IJwtService
    {
        string GenerateToken(UserLoginResponseDto user);

        string GenerateRefreshToken();
        DateTime GetTokenExpiryTime();
    }
}
