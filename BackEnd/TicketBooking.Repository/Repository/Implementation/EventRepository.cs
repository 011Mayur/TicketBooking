using System.Data;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;

namespace TicketBooking.Repository.Repository.Implementation
{
    public class EventRepository(IConfiguration config, ILogger<EventRepository> logger)
        : IEventRepository
    {
        private readonly IConfiguration _config = config;

        private readonly ILogger<EventRepository> _logger = logger;
        private string ConnectionString =>
            _config["ConnectionStrings:DefaultConnection"]
            ?? throw new InvalidOperationException("Connection string not found.");

        public async Task<int> CreateEventAsync(EventCreateDto dto)
        {
            DateTime currentTime = DateTime.UtcNow;
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("create_event", connection);
            command.CommandType = CommandType.StoredProcedure;

            MySqlParameter outputId = new()
            {
                ParameterName = "@p_new_id",
                MySqlDbType = MySqlDbType.Int32,
                Direction = ParameterDirection.Output,
            };
            MySqlParameter[] parameters =
            [
                new("@p_title", dto.Title),
                new("@p_artist_name", dto.ArtistName),
                new("@p_venue", dto.Venue),
                new("@p_event_date", dto.EventDate),
                new("@p_event_time", dto.EventTime),
                new("@p_ticket_price", dto.TicketPrice),
                new("@p_total_seats", dto.TotalSeats),
                new("@p_is_active", dto.isActive),
                new("@p_created_at", currentTime),
                new(
                    "@p_bulk_ticket_for_discount",
                    (object?)dto.BulkTicketForDiscount ?? DBNull.Value
                ),
                new("@p_discount_percentage", (object?)dto.DiscountPercentage ?? DBNull.Value),
                new("@p_poster_image_url", (object?)dto.PosterImageUrl ?? DBNull.Value),
                new("@p_event_category_id", dto.EventCategoryId),
                new("@p_description", dto.Description),
                outputId,
            ];

            command.Parameters.AddRange(parameters);

            await command.ExecuteNonQueryAsync();
            int eventId = Convert.ToInt32(outputId.Value);
            if (dto.SelectedCouponIds.Count > 0)
            {
                await AddEventCouponsAsync(connection, eventId, dto.SelectedCouponIds);
            }
            return eventId;
        }

        public async Task<EventResponseDto?> GetEventByIdAsync(int id)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            EventResponseDto? evt = null;

            await using (MySqlCommand command = new("get_event_by_id", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.Add(new("@p_id", id));

                await using MySqlDataReader reader = (MySqlDataReader)
                    await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    return null;

                evt = MapEvent(reader);
            }

            evt.AppliedCoupons = await GetEventCouponsAsync(connection, id);
            evt.CouponIds = evt.AppliedCoupons.Select(c => c.Id).ToList();

            return evt;
        }

        public async Task<EventForBooking?> GetEventForBooking(int id)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            EventForBooking evt;

            await using (MySqlCommand command = new("get_event_detail", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.Add(new("@p_id", id));

                await using MySqlDataReader reader = (MySqlDataReader)
                    await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                    return null;
                evt = new()
                {
                    Id = reader.GetInt32("id"),
                    Title = reader.GetString("title"),
                    ArtistName = reader.GetString("artist_name"),
                    Description = reader.GetString("description"),
                    Venue = reader.GetString("venue"),
                    EventDate = reader.GetDateTime("event_date"),
                    EventTime = reader.GetTimeSpan("event_time"),
                    TicketPrice = reader.GetDecimal("ticket_price"),

                    AvailableSeats = reader.GetInt32("available_seats"),
                    BulkTicketForDiscount = reader.IsDBNull("bulk_ticket_for_discount")
                        ? null
                        : reader.GetInt32("bulk_ticket_for_discount"),
                    DiscountPercentage = reader.IsDBNull("discount_percentage")
                        ? null
                        : reader.GetDecimal("discount_percentage"),
                    PosterImageUrl = reader.IsDBNull("poster_image_url")
                        ? null
                        : reader.GetString("poster_image_url"),
                };
            }

            return evt;
        }

        public async Task<int> UpdateEventAsync(EventUpdateDto dto)
        {
            try
            {
                await using MySqlConnection connection = new(ConnectionString);
                await connection.OpenAsync();

                await using MySqlCommand command = new("update_event", connection);
                command.CommandType = CommandType.StoredProcedure;
                MySqlParameter[] parameters =
                [
                    new("@p_id", dto.Id),
                    new("@p_title", dto.Title),
                    new("@p_artist_name", dto.ArtistName),
                    new("@p_venue", dto.Venue),
                    new("@p_event_date", dto.EventDate),
                    new("@p_event_time", dto.EventTime),
                    new("@p_ticket_price", dto.TicketPrice),
                    new("@p_total_seats", dto.TotalSeats),
                    new("@p_bulk_ticket_for_discount", dto.BulkTicketForDiscount),
                    new("@p_discount_percentage", dto.DiscountPercentage),
                    new("@p_poster_image_url", (object?)dto.PosterImageUrl ?? DBNull.Value),
                    new("@p_event_category_id", dto.EventCategoryId),
                    new("@p_description", dto.Description),
                ];
                command.Parameters.AddRange(parameters);
                if (dto.SelectedCouponIds.Count > 0)
                {
                    await AddEventCouponsAsync(connection, dto.Id, dto.SelectedCouponIds);
                }
                return await command.ExecuteNonQueryAsync();
            }
            catch (MySqlException ex) when (ex.Number == 1644)
            {
                throw new BusinessRuleException(ex.Message);
            }
            catch (MySqlException ex)
            {
                throw new Exception($"Database error: {ex.Message}", ex);
            }
        }

        public async Task DeleteEventAsync(int id)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("delete_event", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_id", id));
            await command.ExecuteNonQueryAsync();
        }

        public async Task<EventPosterDto?> GetEventPosterByIdAsync(int id)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_event_poster_by_id", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_event_id", id));

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new EventPosterDto
                {
                    PosterImageUrl = reader.IsDBNull(0) ? null : reader.GetString(0),
                };
            }

            return null;
        }

        public async Task<List<HomePageEvent>> GetEventsAsync(int page, int? typeId = null)
        {
            List<HomePageEvent> events = [];
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_events_by_type_paginated", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_type_id", (object?)typeId ?? DBNull.Value));

            command.Parameters.Add(new("@p_page", page));

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                events.Add(MapHomeEvent(reader));

            return events;
        }

        public async Task<(List<EventResponseDto> Items, int TotalCount)> GetPagedEventsAsync(
            EventSearchParameter query,
            int categoryId
        )
        {
            List<EventResponseDto> items = [];

            await using (MySqlConnection connection = new(ConnectionString))
            {
                await connection.OpenAsync();

                await using MySqlCommand command = new("get_events_paged", connection);
                command.CommandType = CommandType.StoredProcedure;
                MySqlParameter[] parameters =
                [
                    new("@p_sort_column", query.SortColumn),
                    new("@p_sort_dir", query.SortDir),
                    new("@p_page", query.Page),
                    new("@p_page_size", query.PageSize),
                    new("@p_category_id", categoryId),
                ];
                command.Parameters.AddRange(parameters);

                await using MySqlDataReader reader = (MySqlDataReader)
                    await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                    items.Add(MapEvent(reader));
            }

            int totalCount;
            await using (MySqlConnection connection = new(ConnectionString))
            {
                await connection.OpenAsync();

                await using MySqlCommand countCommand = new("get_events_count", connection);
                countCommand.Parameters.AddWithValue("@p_event_category_id", categoryId);
                countCommand.CommandType = CommandType.StoredProcedure;

                object? result = await countCommand.ExecuteScalarAsync();
                totalCount = Convert.ToInt32(result);
            }

            return (items, totalCount);
        }

        public async Task<bool> HasNextPageAsync(int page, int? typeId = null)
        {
            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("check_type_next_page_exists", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_type_id", (object?)typeId ?? DBNull.Value));
            command.Parameters.Add(new("@p_page", page));

            var result = await command.ExecuteScalarAsync();
            return result != null && (long)result > 0;
        }

        public async Task<List<HomePageEvent>> SearchEventsAsync(
            string? searchQuery,
            int page,
            int? typeId = null
        )
        {
            List<HomePageEvent> events = [];

            if (string.IsNullOrWhiteSpace(searchQuery))
                return events;

            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("search_events_by_type", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_search_query", searchQuery.Trim()));
            command.Parameters.Add(new("@p_type_id", (object?)typeId ?? DBNull.Value));
            command.Parameters.Add(new("@p_page", page));

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
                events.Add(MapHomeEvent(reader));

            return events;
        }

        public async Task<bool> HasSearchNextPageAsync(
            string? searchQuery,
            int page,
            int? typeId = null
        )
        {
            if (string.IsNullOrWhiteSpace(searchQuery))
                return false;

            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new(
                "check_search_type_next_page_exists",
                connection
            );
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new("@p_search_query", searchQuery.Trim()));
            command.Parameters.Add(new("@p_type_id", (object?)typeId ?? DBNull.Value));
            command.Parameters.Add(new("@p_page", page));

            var result = await command.ExecuteScalarAsync();
            return result != null && (long)result > 0;
        }

        private async Task<List<CouponCodeDto>> GetEventCouponsAsync(
            MySqlConnection connection,
            int eventId
        )
        {
            List<CouponCodeDto> coupons = [];

            try
            {
                await using MySqlCommand command = new("get_event_coupons", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.Add(new("@p_event_id", eventId));

                await using MySqlDataReader reader = (MySqlDataReader)
                    await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    coupons.Add(
                        new CouponCodeDto
                        {
                            Id = reader.GetInt32("id"),
                            Code = reader.GetString("code"),
                            DiscountPercentage = reader.GetDecimal("discount_percentage"),
                        }
                    );
                }
            }
            catch (MySqlException ex)
            {
                _logger.LogError(ex, "Failed to fetch coupons for eventId {EventId}", eventId);
            }

            return coupons;
        }

        private async Task AddEventCouponsAsync(
            MySqlConnection connection,
            int eventId,
            List<int> couponIds
        )
        {
            await using MySqlCommand command = new("add_coupons_to_event", connection);

            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@p_event_id", eventId);

            string jsonCouponIds = JsonSerializer.Serialize(couponIds);
            command.Parameters.AddWithValue("@p_coupon_ids", jsonCouponIds);

            try
            {
                await command.ExecuteNonQueryAsync();
            }
            catch (MySqlException ex) when (ex.Message.Contains("Event not found"))
            {
                throw new ResourceNotFoundException("Event", eventId);
            }
            catch (MySqlException ex)
            {
                throw new InvalidOperationException($"Failed to add coupons: {ex.Message}");
            }
        }

        private static EventResponseDto MapEvent(MySqlDataReader reader) =>
            new()
            {
                Id = reader.GetInt32("id"),
                Title = reader.GetString("title"),
                ArtistName = reader.GetString("artist_name"),
                Description = reader.GetString("description"),
                Venue = reader.GetString("venue"),
                EventDate = reader.GetDateTime("event_date"),
                EventTime = reader.GetTimeSpan("event_time"),
                TicketPrice = reader.GetDecimal("ticket_price"),
                TotalSeats = reader.GetInt32("total_seats"),
                AvailableSeats = reader.GetInt32("available_seats"),
                BulkTicketForDiscount = reader.IsDBNull("bulk_ticket_for_discount")
                    ? null
                    : reader.GetInt32("bulk_ticket_for_discount"),
                DiscountPercentage = reader.IsDBNull("discount_percentage")
                    ? null
                    : reader.GetDecimal("discount_percentage"),
                PosterImageUrl = reader.IsDBNull("poster_image_url")
                    ? null
                    : reader.GetString("poster_image_url"),
                CouponIds = [],
                AppliedCoupons = [],
                EventCategoryId = reader.GetInt32("event_category_id"),
                EventTypeId = reader.GetInt32("event_type_id"),
            };

        private static HomePageEvent MapHomeEvent(MySqlDataReader reader) =>
            new()
            {
                Id = reader.GetInt32("id"),
                Title = reader.GetString("title"),

                Venue = reader.GetString("venue"),
                EventDate = reader.GetDateTime("event_date"),

                PosterImageUrl = reader.IsDBNull("poster_image_url")
                    ? null
                    : reader.GetString("poster_image_url"),
            };
    }
}
