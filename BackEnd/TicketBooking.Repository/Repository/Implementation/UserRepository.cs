using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MySqlConnector;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;

namespace TicketBooking.Repository.Repository.Implementation
{
    public class UserRepository(AppDbContext db, IConfiguration config) : IUserRepository
    {
        private readonly AppDbContext _db = db;
        private readonly IConfiguration _config = config;

        public async Task<UserLoginResponseDto?> GetUserByEmailAndRole(
            string Emaiil,
            Role Role = Role.User
        )
        {
            MySqlParameter[] parameters = [new("@p_email", Emaiil), new("@p_role", Role)];

            return await _db
                .Database.SqlQueryRaw<UserLoginResponseDto>(
                    "CALL get_user_by_email_role(@p_email,@p_role)",
                    parameters
                )
                .AsAsyncEnumerable()
                .FirstOrDefaultAsync();
        }

        public async Task<UserLoginResponseDto?> GetUserByEmail(
            string Emaiil
            
        )
        {
            MySqlParameter[] parameters = [new("@p_email", Emaiil)];

            return await _db
                .Database.SqlQueryRaw<UserLoginResponseDto>(
                    "CALL get_user_by_email(@p_email)",
                    parameters
                )
                .AsAsyncEnumerable()
                .FirstOrDefaultAsync();
        }

        public async Task<int> AddUserAsync(UserRegisterDto user)
        {
            string connectionString =
                _config["ConnectionStrings:DefaultConnection"]
                ?? throw new InvalidOperationException(ExceptionMessage.ConnectionStringNotFound);

            await using (MySqlConnection connection = new(connectionString))
            {
                await connection.OpenAsync();

                await using (MySqlCommand command = new("add_user", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    MySqlParameter outputIdParam = new()
                    {
                        ParameterName = "@newId",
                        MySqlDbType = MySqlDbType.Int32,
                        Direction = ParameterDirection.Output,
                    };

                    MySqlParameter[] parameters =
                    [
                        new("@p_first_name", user.FirstName),
                        new("@p_last_name", user.LastName),
                        new("@p_email", user.Email),
                        new("@p_password_hash", user.PasswordHash),
                        new("@p_mobile_number", user.MobileNumber),
                        new("@p_date_of_birth", user.DateOfBirth),
                        new("@p_role", user.Role),
                        new("@p_gender", user.Gender),
                        new("@p_is_active", user.IsActive),
                        new("@p_created_at", user.CreatedAt),
                        outputIdParam,
                    ];

                    command.Parameters.AddRange(parameters);

                    try
                    {
                        await command.ExecuteNonQueryAsync();
                        return Convert.ToInt32(outputIdParam.Value);
                    }
                    catch (MySqlException ex) when (ex.Number == 1062)
                    {
                        if (ex.Message.Contains("email", StringComparison.OrdinalIgnoreCase))
                            throw new DuplicateFieldException(
                                "email",
                                "Email is already registered."
                            );
                        if (ex.Message.Contains("mobile", StringComparison.OrdinalIgnoreCase))
                            throw new DuplicateFieldException(
                                "mobileNumber",
                                "Mobile number is already registered."
                            );
                        throw;
                    }
                }
            }
        }

        public async Task CreateResetTokenAsync(int userId, string tokenHash, DateTime expiresAt)
        {
            DateTime currentIme = DateTime.UtcNow;
            MySqlParameter[] parameters =
            [
                new("@p_user_id", userId),
                new("@p_token_hash", tokenHash),
                new("@p_expires_at", expiresAt),
                new("@p_created_at", currentIme),
            ];
            await ExecuteStoredProcedure("create_reset_token", parameters);
        }

        public async Task<(int UserId, DateTime ExpiresAt, bool Used)?> GetValidResetTokenAsync(
            string tokenHash
        )
        {
            string connectionString = _config["ConnectionStrings:DefaultConnection"]!;
            await using MySqlConnection connection = new(connectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_valid_reset_token", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_token_hash", tokenHash));

            await using MySqlDataReader reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return null;

            return (
                reader.GetInt32("user_id"),
                reader.GetDateTime("expires_at"),
                reader.GetBoolean("is_used")
            );
        }

        public async Task MarkTokenUsedAsync(string tokenHash)
        {
            MySqlParameter[] parameters = [new("@p_token_hash", tokenHash)];
            await ExecuteStoredProcedure("mark_token_used", parameters);
        }

        public async Task UpdatePasswordAsync(int userId, string passwordHash)
        {
            MySqlParameter[] parameters =
            [
                new("@p_user_id", userId),
                new("@p_password_hash", passwordHash),
            ];
            await ExecuteStoredProcedure("update_password", parameters);
        }

        public async Task<RefreshTokenDto?> GetRefreshTokenAsync(string token)
        {
            MySqlParameter parameter = new("@p_token", token);

            return await _db
                .Database.SqlQueryRaw<RefreshTokenDto>(
                    "CALL get_refresh_token(@p_token)",
                    parameter
                )
                .AsAsyncEnumerable()
                .FirstOrDefaultAsync();
        }

        public async Task CreateRefreshTokenAsync(int userId, string token, DateTime expiresAt)
        {
            MySqlParameter[] parameters =
            [
                new("@p_user_id", userId),
                new("@p_token", token),
                new("@p_expires_at", expiresAt),
                new("@p_created_at", DateTime.UtcNow),
            ];

            await ExecuteStoredProcedure("create_refresh_token", parameters);
        }

        public async Task DeleteRefreshTokenAsync(string token)
        {
            MySqlParameter[] parameter = [new("@p_token", token)];
            await ExecuteStoredProcedure("delete_refresh_token", parameter);
        }

        public async Task<UserLoginResponseDto?> GetUserByIdAsync(int userId)
        {
            MySqlParameter parameter = new("@p_user_id", userId);

            return await _db
                .Database.SqlQueryRaw<UserLoginResponseDto>(
                    "CALL get_user_by_id(@p_user_id)",
                    parameter
                )
                .AsAsyncEnumerable()
                .FirstOrDefaultAsync();
        }

        private async Task ExecuteStoredProcedure(
            string StoredProcedure,
            MySqlParameter[] parameters
        )
        {
            string connectionString = _config["ConnectionStrings:DefaultConnection"]!;
            await using MySqlConnection connection = new(connectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new(StoredProcedure, connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddRange(parameters);

            await command.ExecuteNonQueryAsync();
        }
    }
}
