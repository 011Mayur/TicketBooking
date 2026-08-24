
using TicketBooking.Repository.Entity;
using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Repository.Repository.Interface
{
    public interface IEventCategoryRepository
    {
        Task<List<EventCategoryListDto>> GetCategoriesByEventTypeAsync(int eventTypeId);
        Task<EventCategory?> GetEventCategoryByIdAsync(int id);
        Task<int> CreateEventCategoryAsync(string name, int eventTypeId);
        Task<bool> UpdateEventCategoryAsync(int id, string name);
        Task<(
            bool canDelete,
            string reason,
            int activeEventCount,
            int pastEventCount
        )> CheckEventCategoryDeletabilityAsync(int id);
        Task<List<PastEventDto>> GetPastEventsByCategoryAsync(int categoryId);
        Task<bool> SoftDeleteEventCategoryAsync(int id);
    }
}
