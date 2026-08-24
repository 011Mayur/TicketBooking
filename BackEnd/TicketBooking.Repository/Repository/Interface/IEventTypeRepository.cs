using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TicketBooking.Repository.Entity;
using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Repository.Repository.Interface
{
    public interface IEventTypeRepository
    {
        Task<List<EventTypeListDto>> GetAllEventTypesAsync();
        Task<EventType?> GetEventTypeByIdAsync(int id);
        Task<int> CreateEventTypeAsync(string name);
        Task<bool> UpdateEventTypeAsync(int id, string name);
        Task<(bool canDelete, string reason, int categoryCount)> CheckEventTypeDeletabilityAsync(
            int id
        );
        Task<bool> SoftDeleteEventTypeAsync(int id);

        Task<List<EventTypeDto>> GetActiveEventTypesAsync();
    }
}
