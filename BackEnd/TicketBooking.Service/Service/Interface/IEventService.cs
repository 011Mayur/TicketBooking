using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Service.Service.Interface
{
    public interface IEventService
    {
        Task<int> CreateEventAsync(EventCreateDto dto);
        Task<EventResponseDto?> GetEventByIdAsync(int id);
        Task UpdateEventAsync(EventUpdateDto dto);
        Task DeleteEventAsync(int id);
        Task<PagedResult<EventResponseDto>> GetPagedEventsAsync(EventSearchParameter query,int categoryId);

        Task<List<HomePageEvent>> GetEventsAsync(int page,int? typeId = null);

        Task<bool> HasNextPageAsync(int page,int? typeId = null);

        Task<EventForBooking> GetEventForBooking(int id);

        Task<List<HomePageEvent>> SearchEventsAsync(string? searchQuery, int page,int? typeId = null);

        Task<bool> HasSearchNextPageAsync(string? searchQuery, int page,int? typeId = null);
    }
}
