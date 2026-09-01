using System.Data;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Entity;
using TicketBooking.Repository.Repository.Interface;

namespace TicketBooking.Repository.Repository.Implementation
{
    public class BookingLockRepository(IConfiguration config) : IBookingLockRepository
    {
        private readonly IConfiguration _config = config;

        private string ConnectionString =>
            _config["ConnectionStrings:DefaultConnection"]
            ?? throw new InvalidOperationException(ExceptionMessage.ConnectionStringNotFound);

        public async Task<BookingLock> CreateBookingLockAsync(
            int eventId,
            int userId,
            int quantity,
            string razorpayOrderId,
            DateTime expiresAt,
            decimal unitPrice,
            decimal subTotal,
            decimal? bulkDiscountPercentage,
            decimal? bulkDiscountAmount,
            int? couponId,
            string? couponCode,
            decimal? couponDiscountPercentage,
            decimal? couponDiscountAmount,
            decimal finalAmount,
            string discountType
        )
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("create_booking_lock", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@p_event_id", eventId);
            command.Parameters.AddWithValue("@p_user_id", userId);
            command.Parameters.AddWithValue("@p_quantity", quantity);
            command.Parameters.AddWithValue("@p_razorpay_order_id", razorpayOrderId);
            command.Parameters.AddWithValue("@p_expires_at", expiresAt);
            command.Parameters.AddWithValue("@p_unit_price", unitPrice);
            command.Parameters.AddWithValue("@p_sub_total", subTotal);
            command.Parameters.AddWithValue(
                "@p_bulk_discount_percentage",
                (object?)bulkDiscountPercentage ?? DBNull.Value
            );
            command.Parameters.AddWithValue(
                "@p_bulk_discount_amount",
                (object?)bulkDiscountAmount ?? DBNull.Value
            );
            command.Parameters.AddWithValue("@p_coupon_id", (object?)couponId ?? DBNull.Value);
            command.Parameters.AddWithValue("@p_coupon_code", (object?)couponCode ?? DBNull.Value);
            command.Parameters.AddWithValue(
                "@p_coupon_discount_percentage",
                (object?)couponDiscountPercentage ?? DBNull.Value
            );
            command.Parameters.AddWithValue(
                "@p_coupon_discount_amount",
                (object?)couponDiscountAmount ?? DBNull.Value
            );
            command.Parameters.AddWithValue("@p_final_amount", finalAmount);
            command.Parameters.AddWithValue("@p_discount_type", discountType);

            MySqlParameter newIdParam = new()
            {
                ParameterName = "@p_new_id",
                MySqlDbType = MySqlDbType.Int32,
                Direction = ParameterDirection.Output,
            };
            command.Parameters.Add(newIdParam);

            await command.ExecuteNonQueryAsync();

            return new BookingLock
            {
                EventId = eventId,
                UserId = userId,
                Quantity = quantity,
                RazorpayOrderId = razorpayOrderId,
                ExpiresAt = expiresAt,
                UnitPrice = unitPrice,
                SubTotal = subTotal,
                BulkDiscountPercentage = bulkDiscountPercentage,
                BulkDiscountAmount = bulkDiscountAmount,
                CouponId = couponId,
                CouponCode = couponCode,
                CouponDiscountPercentage = couponDiscountPercentage,
                CouponDiscountAmount = couponDiscountAmount,
                FinalAmount = finalAmount,
                DiscountType = discountType,
                Id = (int)newIdParam.Value!,
            };
        }

        public async Task<BookingLock?> GetLockByOrderIdAsync(string razorpayOrderId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_lock_by_order_id", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@p_razorpay_order_id", razorpayOrderId);

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return null;

            return new BookingLock
            {
                Id = reader.GetInt32("id"),
                EventId = reader.GetInt32("event_id"),
                UserId = reader.GetInt32("user_id"),
                Quantity = reader.GetInt32("quantity"),
                RazorpayOrderId = reader.GetString("razorpay_order_id"),
                ExpiresAt = reader.GetDateTime("expires_at"),
                CreatedAt = reader.GetDateTime("created_at"),
                UnitPrice = reader.GetDecimal("unit_price"),
                SubTotal = reader.GetDecimal("sub_total"),
                BulkDiscountPercentage = reader.IsDBNull(
                    reader.GetOrdinal("bulk_discount_percentage")
                )
                    ? null
                    : reader.GetDecimal("bulk_discount_percentage"),
                BulkDiscountAmount = reader.IsDBNull(reader.GetOrdinal("bulk_discount_amount"))
                    ? null
                    : reader.GetDecimal("bulk_discount_amount"),
                CouponId = reader.IsDBNull(reader.GetOrdinal("coupon_id"))
                    ? null
                    : reader.GetInt32("coupon_id"),
                CouponCode = reader.IsDBNull(reader.GetOrdinal("coupon_code"))
                    ? null
                    : reader.GetString("coupon_code"),
                CouponDiscountPercentage = reader.IsDBNull(
                    reader.GetOrdinal("coupon_discount_percentage")
                )
                    ? null
                    : reader.GetDecimal("coupon_discount_percentage"),
                CouponDiscountAmount = reader.IsDBNull(reader.GetOrdinal("coupon_discount_amount"))
                    ? null
                    : reader.GetDecimal("coupon_discount_amount"),
                FinalAmount = reader.GetDecimal("final_amount"),
                DiscountType = reader.GetString("discount_type"),
            };
        }

        public async Task<List<BookingLock>> GetActiveLocksByEventIdAsync(int eventId)
        {
            List<BookingLock> locks = [];

            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_active_locks_by_event_id", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@p_event_id", eventId);

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                locks.Add(
                    new BookingLock
                    {
                        Id = reader.GetInt32("id"),
                        EventId = reader.GetInt32("event_id"),
                        UserId = reader.GetInt32("user_id"),
                        Quantity = reader.GetInt32("quantity"),
                        RazorpayOrderId = reader.GetString("razorpay_order_id"),
                        ExpiresAt = reader.GetDateTime("expires_at"),
                        CreatedAt = reader.GetDateTime("created_at"),
                        UnitPrice = reader.GetInt32("unit_price"),
                        SubTotal = reader.GetInt32("sub_total"),
                        FinalAmount = reader.GetInt32("final_amount"),
                        DiscountType = reader.GetString("discount_type"),
                    }
                );
            }

            return locks;
        }

        public async Task<bool> DeleteLockAsync(string razorpayOrderId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("delete_lock_by_order_id", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@p_razorpay_order_id", razorpayOrderId);

            MySqlParameter deletedParam = new()
            {
                ParameterName = "@p_deleted",
                MySqlDbType = MySqlDbType.Bit,
                Direction = ParameterDirection.Output,
            };
            command.Parameters.Add(deletedParam);

            await command.ExecuteNonQueryAsync();

            return deletedParam.Value != DBNull.Value && Convert.ToBoolean(deletedParam.Value);
        }

        public async Task<int> DeleteExpiredLocksAsync()
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("delete_expired_locks", connection);
            command.CommandType = CommandType.StoredProcedure;

            MySqlParameter deletedCountParam = new()
            {
                ParameterName = "@p_deleted_count",
                MySqlDbType = MySqlDbType.Int32,
                Direction = ParameterDirection.Output,
            };
            command.Parameters.Add(deletedCountParam);

            await command.ExecuteNonQueryAsync();

            return deletedCountParam.Value != DBNull.Value
                ? Convert.ToInt32(deletedCountParam.Value)
                : 0;
        }

        public async Task<int> GetTotalLockedQuantityAsync(int eventId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_total_locked_quantity", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@p_event_id", eventId);

            MySqlParameter totalQuantityParam = new()
            {
                ParameterName = "@p_total_quantity",
                MySqlDbType = MySqlDbType.Int32,
                Direction = ParameterDirection.Output,
            };
            command.Parameters.Add(totalQuantityParam);

            await command.ExecuteNonQueryAsync();

            return totalQuantityParam.Value != DBNull.Value
                ? Convert.ToInt32(totalQuantityParam.Value)
                : 0;
        }

        public async Task DeleteExistingLockForUserAsync(int userId, int eventId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new(
                "DELETE FROM booking_locks WHERE user_id = @p_user_id AND event_id = @p_event_id",
                connection
            );
            command.CommandType = CommandType.Text;
            command.Parameters.AddWithValue("@p_user_id", userId);
            command.Parameters.AddWithValue("@p_event_id", eventId);

            await command.ExecuteNonQueryAsync();
        }
    }
}
