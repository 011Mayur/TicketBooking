using System.Data;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using TicketBooking.Repository.Entity;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;

namespace TicketBooking.Repository.Repository.Implementation
{
    public class EventCategoryRepository(IConfiguration config) : IEventCategoryRepository
    {
        private readonly IConfiguration _config = config;
        private string ConnectionString =>
            _config["ConnectionStrings:DefaultConnection"]
            ?? throw new InvalidOperationException("Connection string not found.");

        public async Task<List<EventCategoryListDto>> GetCategoriesByEventTypeAsync(int eventTypeId)
        {
            var result = new List<EventCategoryListDto>();

            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "get_categories_by_event_type";
                    command.Parameters.AddWithValue("@p_event_type_id", eventTypeId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var categoryId = reader.GetInt32(0);
                            var (canDelete, reason, activeCount, pastCount) =
                                await CheckEventCategoryDeletabilityAsync(categoryId);

                            result.Add(
                                new EventCategoryListDto
                                {
                                    Id = categoryId,
                                    Name = reader.GetString(1),
                                    EventTypeId = reader.GetInt32(2),
                                    ActiveEventCount = activeCount,
                                    PastEventCount = pastCount,
                                    CanDelete = canDelete,
                                    DeletionReason = reason,
                                    CreatedAt = reader.GetDateTime(3),
                                }
                            );
                        }
                    }
                }
            }

            return result;
        }

        public async Task<EventCategory?> GetEventCategoryByIdAsync(int id)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "get_event_category_by_id";
                    command.Parameters.AddWithValue("@p_id", id);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new EventCategory
                            {
                                Id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                EventTypeId = reader.GetInt32(2),
                                IsActive = reader.GetBoolean(3),
                                CreatedAt = reader.GetDateTime(4),
                            };
                        }
                    }
                }
            }

            return null;
        }

        public async Task<int> CreateEventCategoryAsync(string name, int eventTypeId)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "create_event_category";
                    command.Parameters.AddWithValue("@p_name", name);
                    command.Parameters.AddWithValue("@p_event_type_id", eventTypeId);

                    var outputParam = new MySqlParameter("@p_id", MySqlDbType.Int32)
                    {
                        Direction = ParameterDirection.Output,
                    };
                    command.Parameters.Add(outputParam);

                    await command.ExecuteNonQueryAsync();
                    return Convert.ToInt32(outputParam.Value);
                }
            }
        }

        public async Task<bool> UpdateEventCategoryAsync(int id, string name)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "update_event_category";
                    command.Parameters.AddWithValue("@p_id", id);
                    command.Parameters.AddWithValue("@p_name", name);

                    var affectedParam = new MySqlParameter("@p_affected", MySqlDbType.Int32)
                    {
                        Direction = ParameterDirection.Output,
                    };
                    command.Parameters.Add(affectedParam);

                    await command.ExecuteNonQueryAsync();
                    return Convert.ToInt32(affectedParam.Value) > 0;
                }
            }
        }

        public async Task<(
            bool canDelete,
            string reason,
            int activeEventCount,
            int pastEventCount
        )> CheckEventCategoryDeletabilityAsync(int id)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "check_event_category_deletability";
                    command.Parameters.AddWithValue("@p_id", id);

                    var activeCountParam = new MySqlParameter("@p_active_count", MySqlDbType.Int32)
                    {
                        Direction = ParameterDirection.Output,
                    };
                    var pastCountParam = new MySqlParameter("@p_past_count", MySqlDbType.Int32)
                    {
                        Direction = ParameterDirection.Output,
                    };
                    command.Parameters.Add(activeCountParam);
                    command.Parameters.Add(pastCountParam);

                    await command.ExecuteNonQueryAsync();

                    int activeCount = Convert.ToInt32(activeCountParam.Value ?? 0);
                    int pastCount = Convert.ToInt32(pastCountParam.Value ?? 0);

                    return (
                        canDelete: activeCount == 0,
                        reason: activeCount > 0
                            ? $"{activeCount} active/future events exist"
                            : "Can be deleted",
                        activeEventCount: activeCount,
                        pastEventCount: pastCount
                    );
                }
            }
        }

        public async Task<List<PastEventDto>> GetPastEventsByCategoryAsync(int categoryId)
        {
            var result = new List<PastEventDto>();

            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "get_past_events_by_category";
                    command.Parameters.AddWithValue("@p_category_id", categoryId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            result.Add(
                                new PastEventDto
                                {
                                    Id = reader.GetInt32(0),
                                    Title = reader.GetString(1),
                                    ArtistName = reader.GetString(2),
                                    Venue = reader.GetString(3),
                                    EventDate = reader.GetDateTime(4),
                                    EventTime = reader.GetFieldValue<TimeSpan>(5),
                                    TicketPrice = reader.GetDecimal(6),
                                    TotalSeats = reader.GetInt32(7),
                                    AvailableSeats = reader.GetInt32(8),
                                    IsActive = reader.GetBoolean(9),
                                    UpdatedAt = reader.IsDBNull(10) ? null : reader.GetDateTime(10),
                                }
                            );
                        }
                    }
                }
            }

            return result;
        }

        public async Task<bool> SoftDeleteEventCategoryAsync(int id)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "soft_delete_event_category";
                    command.Parameters.AddWithValue("@p_id", id);

                    var affectedParam = new MySqlParameter("@p_affected", MySqlDbType.Int32)
                    {
                        Direction = ParameterDirection.Output,
                    };
                    command.Parameters.Add(affectedParam);

                    await command.ExecuteNonQueryAsync();
                    return Convert.ToInt32(affectedParam.Value) > 0;
                }
            }
        }
    }
}
