using System.Data;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;

namespace TicketBooking.Repository.Repository.Implementation
{
    public class CouponRepository(IConfiguration config) : ICouponRepository
    {
        private readonly IConfiguration _config = config;
        private string ConnectionString =>
            _config["ConnectionStrings:DefaultConnection"]
            ?? throw new InvalidOperationException(ExceptionMessage.ConnectionStringNotFound);

        public async Task<int> CreateCouponAsync(CouponCreateDto dto)
        {
            DateTime currentTime = DateTime.UtcNow;
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("create_coupon", connection);
            command.CommandType = CommandType.StoredProcedure;

            MySqlParameter outputId = new()
            {
                ParameterName = "@p_new_id",
                MySqlDbType = MySqlDbType.Int32,
                Direction = ParameterDirection.Output,
            };
            MySqlParameter[] parameters =
            [
                new("@p_code", dto.Code),
                new("@p_discount_percentage", dto.DiscountPercentage),
                new("@p_expiry_date", dto.ExpiryDate),
                new("@p_is_active", dto.IsActive),
                new("@p_created_at", currentTime),
                outputId,
            ];
            command.Parameters.AddRange(parameters);

            await command.ExecuteNonQueryAsync();
            return Convert.ToInt32(outputId.Value);
        }

        public async Task<List<CouponResponseDto>> GetAllCouponsAsync()
        {
            List<CouponResponseDto> coupons = [];
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_all_coupons", connection);
            command.CommandType = CommandType.StoredProcedure;

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                coupons.Add(MapCoupon(reader));

            return coupons;
        }

        public async Task<List<CouponResponseDto>> GetAllActiveCouponsAsync()
        {
            List<CouponResponseDto> coupons = [];
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_active_coupons", connection);
            command.CommandType = CommandType.StoredProcedure;

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                coupons.Add(MapCoupon(reader));

            return coupons;
        }

        public async Task<CouponResponseDto?> GetCouponByIdAsync(int id)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_coupon_by_id", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_id", id));

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return null;

            return MapCoupon(reader);
        }

        public async Task UpdateCouponAsync(CouponUpdateDto dto)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("update_coupon", connection);
            command.CommandType = CommandType.StoredProcedure;
            MySqlParameter[] parameters =
            [
                new("@p_id", dto.Id),
                new("@p_code", dto.Code),
                new("@p_discount_percentage", dto.DiscountPercentage),
                new("@p_expiry_date", dto.ExpiryDate),
                new("@p_is_active", dto.IsActive),
            ];
            command.Parameters.AddRange(parameters);
            await command.ExecuteNonQueryAsync();
        }

        public async Task TogglCouponStatusAsync(int id)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("toggl_coupon_status", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_id", id));
            await command.ExecuteNonQueryAsync();
        }

        public async Task<bool> HasUserUsedCouponAsync(int couponId, int userId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("has_user_used_coupon", connection);
            command.CommandType = CommandType.StoredProcedure;
            MySqlParameter[] paramters = [new("@p_coupon_id", couponId), new("@p_user_id", userId)];
            command.Parameters.AddRange(paramters);

            object? result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result) > 0;
        }

        public async Task<CouponValidationDto?> GetCouponForValidationAsync(
            string code,
            int eventId,
            int userId
        )
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_coupon_for_booking_validation", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_code", code));
            command.Parameters.Add(new("@p_event_id", eventId));
            command.Parameters.Add(new("@p_user_id", userId));

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return null;

            return new CouponValidationDto
            {
                Id = reader.GetInt32("id"),
                Code = reader.GetString("code"),
                DiscountPercentage = reader.GetDecimal("discount_percentage"),
                ExpiryDate = reader.GetDateTime("expiry_date"),
                IsActive = reader.GetBoolean("is_active"),
                IsLinkedToEvent = reader.GetBoolean("is_linked_to_event"),
                AlreadyUsedByUser = reader.GetBoolean("already_used_by_user"),
            };
        }

        private static CouponResponseDto MapCoupon(MySqlDataReader reader) =>
            new()
            {
                Id = reader.GetInt32("id"),
                Code = reader.GetString("code"),
                DiscountPercentage = reader.GetDecimal("discount_percentage"),
                ExpiryDate = reader.GetDateTime("expiry_date"),
                IsActive = reader.GetBoolean("is_active"),
            };
    }
}
