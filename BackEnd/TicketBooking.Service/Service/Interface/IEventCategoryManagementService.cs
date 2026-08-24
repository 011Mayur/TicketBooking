using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Service.Service.Interface
{
    public interface IEventCategoryManagementService
    {
        Task<List<EventCategoryListDto>> GetCategoriesByEventTypeAsync(int eventTypeId);
        Task<EventCategoryListDto?> GetEventCategoryByIdAsync(int id);
        Task<int> CreateEventCategoryAsync(EventCategoryCreateUpdateDto dto);
        Task UpdateEventCategoryAsync(int id, EventCategoryCreateUpdateDto dto);
        Task DeleteEventCategoryAsync(int id);
        Task<List<PastEventDto>> GetPastEventsByCategoryAsync(int categoryId);
    }
}
