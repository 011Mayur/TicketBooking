using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Repository.Repository.Interface
{
    public interface IUserRepository
    {
        Task<UserLoginResponseDto?> GetUserByEmail(string email);

        Task<int> AddUserAsync(UserRegisterDto user);

        Task CreateResetTokenAsync(int userId, string tokenHash, DateTime expiresAt);
        Task<(int UserId, DateTime ExpiresAt, bool Used)?> GetValidResetTokenAsync(
            string tokenHash
        );
        Task MarkTokenUsedAsync(string tokenHash);
        Task UpdatePasswordAsync(int userId, string passwordHash);
    }
}
