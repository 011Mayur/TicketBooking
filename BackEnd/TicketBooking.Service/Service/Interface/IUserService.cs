using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Service.Service.Interface
{
    public interface IUserService
    {
        Task<int> AddUserAsync(UserRegisterDto user);

        Task<UserLoginResponseDto?> ValidateUserAsync(UserLoginDto login);

        Task RequestPasswordResetAsync(string email);
        Task<bool> ResetPasswordAsync(string rawToken, string newPassword);

        Task<string> CreateRefreshTokenAsync(int userId);
        Task<RefreshTokenDto?> ValidateRefreshTokenAsync(string token);
        Task DeleteRefreshTokenAsync(string token);
        Task<UserLoginResponseDto?> GetUserByIdAsync(int userId);
    }
}
