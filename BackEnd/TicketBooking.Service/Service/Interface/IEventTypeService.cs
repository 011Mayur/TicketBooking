using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Service.Service.Interface
{
    public interface IEventTypeService
    {
        Task<List<EventTypeListDto>> GetAllEventTypesAsync();
        Task<EventTypeListDto?> GetEventTypeByIdAsync(int id);
        Task<int> CreateEventTypeAsync(EventTypeCreateUpdateDto dto);
        Task<bool> UpdateEventTypeAsync(int id, EventTypeCreateUpdateDto dto);
        Task DeleteEventTypeAsync(int id);

        Task<List<EventTypeDto>> GetActiveEventTypesAsync();
    }
}
