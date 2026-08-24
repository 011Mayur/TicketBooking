using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using TicketBooking.Repository.Entity;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;

namespace TicketBooking.Repository.Repository.Implementation
{
    public class EventTypeRepository(IConfiguration config) : IEventTypeRepository
    {
        private readonly IConfiguration _config = config;
        private string ConnectionString =>
            _config["ConnectionStrings:DefaultConnection"]
            ?? throw new InvalidOperationException("Connection string not found.");

        public async Task<List<EventTypeListDto>> GetAllEventTypesAsync()
        {
            var result = new List<EventTypeListDto>();

            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "get_all_event_types";

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var categoryCount = reader.GetInt32(2);
                            result.Add(
                                new EventTypeListDto
                                {
                                    Id = reader.GetInt32(0),
                                    Name = reader.GetString(1),
                                    CategoryCount = categoryCount,
                                    CanDelete = categoryCount == 0,
                                    DeletionReason =
                                        categoryCount > 0
                                            ? $"{categoryCount} categories exist. Delete all categories first."
                                            : "Can be deleted",
                                    CreatedAt = reader.GetDateTime(3),
                                }
                            );
                        }
                    }
                }
            }

            return result;
        }

        public async Task<EventType?> GetEventTypeByIdAsync(int id)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "get_event_type_by_id";
                    command.Parameters.AddWithValue("@p_id", id);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new EventType
                            {
                                Id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                IsActive = reader.GetBoolean(2),
                                CreatedAt = reader.GetDateTime(3),
                            };
                        }
                    }
                }
            }

            return null;
        }

        public async Task<int> CreateEventTypeAsync(string name)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "create_event_type";
                    command.Parameters.AddWithValue("@p_name", name);

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

        public async Task<bool> UpdateEventTypeAsync(int id, string name)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "update_event_type";
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
            int categoryCount
        )> CheckEventTypeDeletabilityAsync(int id)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "check_event_type_deletability";
                    command.Parameters.AddWithValue("@p_id", id);

                    var countParam = new MySqlParameter("@p_category_count", MySqlDbType.Int32)
                    {
                        Direction = ParameterDirection.Output,
                    };
                    command.Parameters.Add(countParam);

                    await command.ExecuteNonQueryAsync();
                    int count = Convert.ToInt32(countParam.Value);

                    return (
                        canDelete: count == 0,
                        reason: count > 0 ? $"{count} active categories exist" : "Can be deleted",
                        categoryCount: count
                    );
                }
            }
        }

        public async Task<bool> SoftDeleteEventTypeAsync(int id)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "soft_delete_event_type";
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

        public async Task<List<EventTypeDto>> GetActiveEventTypesAsync()
        {
            List<EventTypeDto> types = [];

            await using MySqlConnection connection = new(ConnectionString);
            await connection.OpenAsync();

            await using MySqlCommand command = new("get_active_event_types", connection);
            command.CommandType = CommandType.StoredProcedure;

            await using MySqlDataReader reader = (MySqlDataReader)
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                types.Add(
                    new EventTypeDto { Id = reader.GetInt32("id"), Name = reader.GetString("name") }
                );
            }

            return types;
        }
    }
}
