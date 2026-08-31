using System.Data;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;

namespace TicketBooking.Repository.Repository.Implementation
{
    public class BookingRepository(IConfiguration config) : IBookingRepository
    {
        private readonly IConfiguration _config = config;

        private string ConnectionString =>
            _config["ConnectionStrings:DefaultConnection"]
            ?? throw new InvalidOperationException("Connection string not found.");


        public async Task<BookingResponseDto?> GetBookingByIdAsync(int id)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_booking_by_id", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_id", id));

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return new BookingResponseDto
            {
                Id = reader.GetInt32("id"),
                UserId = reader.GetInt32("user_id"),
                EventId = reader.GetInt32("event_id"),
                EventTitle = reader.GetString("event_title"),
                Quantity = reader.GetInt32("quantity"),
                UnitPrice = reader.GetDecimal("unit_price"),
                SubTotal = reader.GetDecimal("sub_total"),
                BulkDiscountPercentage = reader.IsDBNull("bulk_discount_percentage")
                    ? null
                    : reader.GetDecimal("bulk_discount_percentage"),
                BulkDiscountAmount = reader.IsDBNull("bulk_discount_amount")
                    ? null
                    : reader.GetDecimal("bulk_discount_amount"),
                FinalAmount = reader.GetDecimal("final_amount"),
                Status = reader.GetString("status"),
                ExpiresAt = reader.GetDateTime("expires_at"),
                CreatedAt = reader.GetDateTime("created_at"),
                CouponCode = reader.IsDBNull("coupon_code")
                    ? null
                    : reader.GetString("coupon_code"),
                CouponDiscountPercentage = reader.IsDBNull("coupon_discount_percentage")
                    ? null
                    : reader.GetDecimal("coupon_discount_percentage"),
                CouponDiscountAmount = reader.IsDBNull("coupon_discount_amount")
                    ? null
                    : reader.GetDecimal("coupon_discount_amount"),
                DiscountType = reader.GetString("discount_type"),
            };
        }

        public async Task<List<int>> GetExpiredPendingBookingIdsAsync()
        {
            List<int> expiredBookingsId = [];

            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_expired_pending_bookings", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_status", BookingStatus.Pending));
            command.Parameters.Add(new("@p_now", DateTime.UtcNow));

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
                expiredBookingsId.Add(reader.GetInt32("id"));

            return expiredBookingsId;
        }

        public async Task UpdateBookingPaymentAsync(
            int userId,
            int bookingId,
            string razorpayOrderId,
            string razorpayPaymentId,
            BookingStatus status
        )
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("update_booking_payment", connection);

            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@p_user_id", userId);
            command.Parameters.AddWithValue("@p_booking_id", bookingId);
            command.Parameters.AddWithValue("@p_razorpay_order_id", razorpayOrderId);
            command.Parameters.AddWithValue("@p_razorpay_payment_id", razorpayPaymentId);
            command.Parameters.AddWithValue("@p_status", status.ToString());
            command.Parameters.AddWithValue("@p_updated_at", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();
        }

        public async Task MarkCouponUsed(int bookingId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("mark_coupon_used", connection);

            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@p_booking_id", bookingId);

            command.Parameters.AddWithValue("@p_used_at", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();
        }

        public async Task SetRazorpayOrderIdAsync(int bookingId, int userId, string razorpayOrderId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("set_booking_razorpay_order", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@p_booking_id", bookingId);
            command.Parameters.AddWithValue("@p_user_id", userId);
            command.Parameters.AddWithValue("@p_razorpay_order_id", razorpayOrderId);
            command.Parameters.AddWithValue("@p_updated_at", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();
        }

        public async Task HandlePaymentFailureAsync(string razorpayOrderId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("handle_payment_failure", connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@p_razorpay_order_id", razorpayOrderId);

            command.Parameters.AddWithValue("@p_failure_reason", "Payment verification failed");

            command.Parameters.AddWithValue("@p_updated_at", DateTime.UtcNow);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<bool> ReleaseBookingAsync(int bookingId)
        {
            using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            using MySqlCommand command = new("release_booking", connection)
            {
                CommandType = CommandType.StoredProcedure,
            };

            command.Parameters.Add(
                new MySqlParameter("p_booking_id", MySqlDbType.Int32)
                {
                    Direction = ParameterDirection.Input,
                    Value = bookingId,
                }
            );

            MySqlParameter releasedParam = new("p_released", MySqlDbType.Bit)
            {
                Direction = ParameterDirection.Output,
            };
            command.Parameters.Add(releasedParam);

            await command.ExecuteNonQueryAsync();

            return releasedParam.Value != DBNull.Value && Convert.ToBoolean(releasedParam.Value);
        }

        public async Task<BookingResponseDto?> GetBookingByOrderIdAsync(string razorpayOrderId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_booking_by_order_id", connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@p_razorpay_order_id", razorpayOrderId);

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return new BookingResponseDto
            {
                Id = reader.GetInt32("id"),
                UserId = reader.GetInt32("user_id"),
                EventId = reader.GetInt32("event_id"),
                EventTitle = reader.GetString("event_title"),
                Quantity = reader.GetInt32("quantity"),
                UnitPrice = reader.GetDecimal("unit_price"),
                SubTotal = reader.GetDecimal("sub_total"),

                BulkDiscountPercentage = reader.IsDBNull("bulk_discount_percentage")
                    ? null
                    : reader.GetDecimal("bulk_discount_percentage"),

                BulkDiscountAmount = reader.IsDBNull("bulk_discount_amount")
                    ? null
                    : reader.GetDecimal("bulk_discount_amount"),

                FinalAmount = reader.GetDecimal("final_amount"),
                Status = reader.GetString("status"),
                ExpiresAt = reader.GetDateTime("expires_at"),
                CreatedAt = reader.GetDateTime("created_at"),

                CouponCode = reader.IsDBNull("coupon_code")
                    ? null
                    : reader.GetString("coupon_code"),

                CouponDiscountPercentage = reader.IsDBNull("coupon_discount_percentage")
                    ? null
                    : reader.GetDecimal("coupon_discount_percentage"),

                CouponDiscountAmount = reader.IsDBNull("coupon_discount_amount")
                    ? null
                    : reader.GetDecimal("coupon_discount_amount"),

                DiscountType = reader.GetString("discount_type"),
            };
        }

        public async Task RestoreSeatsAsync(int eventId, int quantity)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("restore_seats", connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@p_event_id", eventId);
            command.Parameters.AddWithValue("@p_quantity", quantity);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<List<EventDiscountCouponDto>> GetEventCouponsAsync(
            int eventId,
            int usedId
        )
        {
            List<EventDiscountCouponDto> eventCoupons = [];
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();
            await using MySqlCommand command = new("get_coupons_for_booking", connection);

            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@p_event_id", eventId);
            command.Parameters.AddWithValue("@p_user_id", usedId);

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
                eventCoupons.Add(MapCoupon(reader));

            return eventCoupons;
        }

        public async Task<EventForPaymentSummary?> GetEventForPaymentSummaryByIdAsync(int eventId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            EventForPaymentSummary? evt = null;

            await using (MySqlCommand command = new("get_event_by_id_summary_page", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.Add(new("@p_event_id", eventId));

                await using MySqlDataReader reader = (MySqlDataReader)
                    await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    return null;

                evt = MapEvent(reader);
            }

            return evt;
        }

        public async Task<IEnumerable<BookingSummaryDto>> GetMyBookingsAsync(int userId)
        {
            var results = new List<BookingSummaryDto>();

            await using var connection = new MySqlConnection(ConnectionString);
            await connection.OpenAsync();

            await using var command = new MySqlCommand("get_my_bookings", connection)
            {
                CommandType = CommandType.StoredProcedure,
            };
            command.Parameters.AddWithValue("p_user_id", userId);

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(
                    new BookingSummaryDto
                    {
                        Id = reader.GetInt32("booking_id"),
                        EventId = reader.GetInt32("event_id"),
                        EventTitle = reader.GetString("event_title"),
                        EventDate = reader.GetDateTime("event_date"),
                        EventTime = reader.GetFieldValue<TimeSpan>(reader.GetOrdinal("event_time")),
                        Venue = reader.GetString("venue"),
                        Quantity = reader.GetInt32("quantity"),
                        FinalAmount = reader.GetDecimal("final_amount"),
                        PaymentStatus = reader.GetString("status"),
                    }
                );
            }

            return results;
        }

        public async Task<bool> ReleaseBookingAsync(int bookingId, BookingStatus status)
        {
            using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            using MySqlCommand command = new("release_booking_hold", connection)
            {
                CommandType = CommandType.StoredProcedure,
            };

            command.Parameters.Add(
                new MySqlParameter("p_booking_id", MySqlDbType.Int32)
                {
                    Direction = ParameterDirection.Input,
                    Value = bookingId,
                }
            );
            command.Parameters.Add(
                new MySqlParameter("p_status", MySqlDbType.String)
                {
                    Direction = ParameterDirection.Input,
                    Value = status.ToString(),
                }
            );

            MySqlParameter releasedParam = new("p_released", MySqlDbType.Bit)
            {
                Direction = ParameterDirection.Output,
            };
            command.Parameters.Add(releasedParam);

            await command.ExecuteNonQueryAsync();

            return releasedParam.Value != DBNull.Value && Convert.ToBoolean(releasedParam.Value);
        }

        public async Task UpdateRazorpayPaymentIdAsync(int bookingId, string razorpayPaymentId)
        {
            using var connection = new MySqlConnection(ConnectionString);
            using var command = new MySqlCommand("update_booking_razorpay_payment_id", connection)
            {
                CommandType = CommandType.StoredProcedure,
            };

            command.Parameters.AddWithValue("p_BookingId", bookingId);
            command.Parameters.AddWithValue("p_RazorpayPaymentId", razorpayPaymentId);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task UpdateBookingStatusAsync(int bookingId, BookingStatus status)
        {
            using var connection = new MySqlConnection(ConnectionString);
            using var command = new MySqlCommand("update_booking_status", connection)
            {
                CommandType = CommandType.StoredProcedure,
            };

            command.Parameters.AddWithValue("p_BookingId", bookingId);
            command.Parameters.AddWithValue("p_Status", status.ToString());

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        public async Task<bool> ValidateSeatsAvailableAsync(int eventId, int quantity)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            // Query to check available seats in events table
            await using MySqlCommand command = new(
                "SELECT available_seats FROM events WHERE id = @event_id",
                connection
            );
            command.CommandType = CommandType.Text;
            command.Parameters.AddWithValue("@event_id", eventId);

            var result = await command.ExecuteScalarAsync();

            if (result == null)
                return false;

            int availableSeats = Convert.ToInt32(result);
            return availableSeats >= quantity;
        }

        public async Task<BookingCreationResult> CreateBookingAsync(
            BookingCreateDto dto,
            BookingStatus status = BookingStatus.Pending
        )
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("create_booking", connection);
            command.CommandType = CommandType.StoredProcedure;

            MySqlParameter outputId = new()
            {
                ParameterName = "@p_new_id",
                MySqlDbType = MySqlDbType.Int32,
                Direction = ParameterDirection.Output,
            };
            MySqlParameter seatsReserved = new()
            {
                ParameterName = "@p_seats_reserved",
                MySqlDbType = MySqlDbType.Byte,
                Direction = ParameterDirection.Output,
            };
            MySqlParameter couponReserved = new()
            {
                ParameterName = "@p_coupon_reserved",
                MySqlDbType = MySqlDbType.Byte,
                Direction = ParameterDirection.Output,
            };

            MySqlParameter[] parameters =
            [
                new("@p_user_id", dto.UserId),
                new("@p_event_id", dto.EventId),
                new("@p_quantity", dto.Quantity),
                new("@p_unit_price", dto.UnitPrice),
                new("@p_sub_total", dto.SubTotal),
                new(
                    "@p_bulk_discount_percentage",
                    (object?)dto.BulkDiscountPercentage ?? DBNull.Value
                ),
                new("@p_bulk_discount_amount", (object?)dto.BulkDiscountAmount ?? DBNull.Value),
                new("@p_coupon_id", (object?)dto.CouponId ?? DBNull.Value),
                new("@p_coupon_code", (object?)dto.CouponCode ?? DBNull.Value),
                new(
                    "@p_coupon_discount_percentage",
                    (object?)dto.CouponDiscountPercentage ?? DBNull.Value
                ),
                new("@p_coupon_discount_amount", (object?)dto.CouponDiscountAmount ?? DBNull.Value),
                new("@p_final_amount", dto.FinalAmount),
                new("@p_status", status.ToString()),
                new("@p_expires_at", dto.ExpiresAt),
                new("@p_created_at", DateTime.UtcNow),
                new("@p_discount_type", dto.DiscountType.ToString()),
                outputId,
                seatsReserved,
                couponReserved,
            ];

            command.Parameters.AddRange(parameters);
            await command.ExecuteNonQueryAsync();

            bool seatsOk = Convert.ToBoolean(seatsReserved.Value);
            bool couponOk = Convert.ToBoolean(couponReserved.Value);

            return new BookingCreationResult
            {
                BookingId = seatsOk && couponOk ? Convert.ToInt32(outputId.Value) : null,
                SeatsAvailable = seatsOk,
                CouponAvailable = couponOk,
            };
        }

        /// <summary>
        /// Atomically creates a booking and marks the coupon as used in a single transaction.
        /// Prevents coupon double-use if a crash occurs between the two operations.
        /// </summary>
        public async Task<BookingCreationResult> CreateBookingAndMarkCouponAsync(
            BookingCreateDto dto,
            BookingStatus status
        )
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlTransaction transaction = await connection.BeginTransactionAsync();

            try
            {
                // Step 1: Create booking
                await using MySqlCommand bookingCommand = new("create_booking", connection, transaction);
                bookingCommand.CommandType = CommandType.StoredProcedure;

                MySqlParameter outputId = new()
                {
                    ParameterName = "@p_new_id",
                    MySqlDbType = MySqlDbType.Int32,
                    Direction = ParameterDirection.Output,
                };
                MySqlParameter seatsReserved = new()
                {
                    ParameterName = "@p_seats_reserved",
                    MySqlDbType = MySqlDbType.Byte,
                    Direction = ParameterDirection.Output,
                };
                MySqlParameter couponReserved = new()
                {
                    ParameterName = "@p_coupon_reserved",
                    MySqlDbType = MySqlDbType.Byte,
                    Direction = ParameterDirection.Output,
                };

                MySqlParameter[] bookingParams =
                [
                    new("@p_user_id", dto.UserId),
                    new("@p_event_id", dto.EventId),
                    new("@p_quantity", dto.Quantity),
                    new("@p_unit_price", dto.UnitPrice),
                    new("@p_sub_total", dto.SubTotal),
                    new(
                        "@p_bulk_discount_percentage",
                        (object?)dto.BulkDiscountPercentage ?? DBNull.Value
                    ),
                    new("@p_bulk_discount_amount", (object?)dto.BulkDiscountAmount ?? DBNull.Value),
                    new("@p_coupon_id", (object?)dto.CouponId ?? DBNull.Value),
                    new("@p_coupon_code", (object?)dto.CouponCode ?? DBNull.Value),
                    new(
                        "@p_coupon_discount_percentage",
                        (object?)dto.CouponDiscountPercentage ?? DBNull.Value
                    ),
                    new("@p_coupon_discount_amount", (object?)dto.CouponDiscountAmount ?? DBNull.Value),
                    new("@p_final_amount", dto.FinalAmount),
                    new("@p_status", status.ToString()),
                    new("@p_expires_at", dto.ExpiresAt),
                    new("@p_created_at", DateTime.UtcNow),
                    new("@p_discount_type", dto.DiscountType.ToString()),
                    outputId,
                    seatsReserved,
                    couponReserved,
                ];

                bookingCommand.Parameters.AddRange(bookingParams);
                await bookingCommand.ExecuteNonQueryAsync();

                bool seatsOk = Convert.ToBoolean(seatsReserved.Value);
                bool couponOk = Convert.ToBoolean(couponReserved.Value);
                int? newBookingId = seatsOk && couponOk ? Convert.ToInt32(outputId.Value) : null;

                // Step 2: If booking succeeded and coupon was used, mark it — within same transaction
                if (newBookingId.HasValue && dto.CouponId.HasValue)
                {
                    await using MySqlCommand couponCommand = new("mark_coupon_used", connection, transaction);
                    couponCommand.CommandType = CommandType.StoredProcedure;
                    couponCommand.Parameters.AddWithValue("@p_booking_id", newBookingId.Value);
                    couponCommand.Parameters.AddWithValue("@p_used_at", DateTime.UtcNow);
                    await couponCommand.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();

                return new BookingCreationResult
                {
                    BookingId = newBookingId,
                    SeatsAvailable = seatsOk,
                    CouponAvailable = couponOk,
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<BookingWithLockDto?> GetBookingWithLockAsync(int bookingId, int userId)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            // First get booking
            await using MySqlCommand bookingCommand = new("get_booking_by_id", connection);
            bookingCommand.CommandType = CommandType.StoredProcedure;
            bookingCommand.Parameters.Add(new("@p_id", bookingId));

            await using MySqlDataReader reader = (MySqlDataReader)
                await bookingCommand.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            BookingResponseDto booking = new()
            {
                Id = reader.GetInt32("id"),
                UserId = reader.GetInt32("user_id"),
                EventId = reader.GetInt32("event_id"),
                EventTitle = reader.GetString("event_title"),
                Quantity = reader.GetInt32("quantity"),
                UnitPrice = reader.GetDecimal("unit_price"),
                SubTotal = reader.GetDecimal("sub_total"),
                BulkDiscountPercentage = reader.IsDBNull("bulk_discount_percentage")
                    ? null
                    : reader.GetDecimal("bulk_discount_percentage"),
                BulkDiscountAmount = reader.IsDBNull("bulk_discount_amount")
                    ? null
                    : reader.GetDecimal("bulk_discount_amount"),
                FinalAmount = reader.GetDecimal("final_amount"),
                Status = reader.GetString("status"),
                ExpiresAt = reader.GetDateTime("expires_at"),
                CreatedAt = reader.GetDateTime("created_at"),
                CouponCode = reader.IsDBNull("coupon_code")
                    ? null
                    : reader.GetString("coupon_code"),
                CouponDiscountPercentage = reader.IsDBNull("coupon_discount_percentage")
                    ? null
                    : reader.GetDecimal("coupon_discount_percentage"),
                CouponDiscountAmount = reader.IsDBNull("coupon_discount_amount")
                    ? null
                    : reader.GetDecimal("coupon_discount_amount"),
                DiscountType = reader.GetString("discount_type"),
            };

            return new BookingWithLockDto
            {
                Booking = booking,
                IsLocked = true, // Determine this based on your logic
            };
        }

        private static EventDiscountCouponDto MapCoupon(MySqlDataReader reader) =>
            new()
            {
                Id = reader.GetInt32("id"),
                Code = reader.GetString("code"),
                DiscountPercentage = reader.GetDecimal("discount_percentage"),
                IsUsed = reader.GetBoolean("is_used"),
            };

        private static EventForPaymentSummary MapEvent(MySqlDataReader reader) =>
            new()
            {
                Id = reader.GetInt32("id"),
                Title = reader.GetString("title"),
                Venue = reader.GetString("venue"),
                ArtistName = reader.GetString("artist_name"),
                EventDate = reader.GetDateTime("event_date"),
                EventTime = reader.GetTimeSpan("event_time"),
                TicketPrice = reader.GetInt32("ticket_price"),
            };
    }
}
