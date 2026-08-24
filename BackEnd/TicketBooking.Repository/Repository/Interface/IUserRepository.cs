using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Repository.Repository.Interface
{
    public interface IUserRepository
    {
        Task<UserLoginResponseDto?> GetUserByEmailAndRole(string email, Role Role = Role.User);

        Task<int> AddUserAsync(UserRegisterDto user);

        Task CreateResetTokenAsync(int userId, string tokenHash, DateTime expiresAt);
        Task<(int UserId, DateTime ExpiresAt, bool Used)?> GetValidResetTokenAsync(
            string tokenHash
        );
        Task MarkTokenUsedAsync(string tokenHash);
        Task UpdatePasswordAsync(int userId, string passwordHash);

        Task<RefreshTokenDto?> GetRefreshTokenAsync(string token);
        Task CreateRefreshTokenAsync(int userId, string token, DateTime expiresAt);
        Task DeleteRefreshTokenAsync(string token);

        Task<UserLoginResponseDto?> GetUserByIdAsync(int userId);
        Task<UserLoginResponseDto?> GetUserByEmail(string Emaiil);
    }
}
