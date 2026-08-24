using TicketBooking.Repository.Entity;
using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Repository.Repository.Interface
{
    public interface IEventRepository
    {
        Task<int> CreateEventAsync(EventCreateDto dto);
        Task<EventResponseDto?> GetEventByIdAsync(int id);
        Task<int> UpdateEventAsync(EventUpdateDto dto);
        Task DeleteEventAsync(int id);
        Task<(List<EventResponseDto> Items, int TotalCount)> GetPagedEventsAsync(
            EventSearchParameter query,
            int categoryId
        );
        Task<EventPosterDto?> GetEventPosterByIdAsync(int id);

        Task<List<HomePageEvent>> GetEventsAsync(int page, int? typeId = null);

        Task<bool> HasNextPageAsync(int page, int? typeId = null);

        Task<EventForBooking?> GetEventForBooking(int id);

        Task<bool> HasSearchNextPageAsync(string? searchQuery, int page, int? typeId = null);

        Task<List<HomePageEvent>> SearchEventsAsync(
            string? searchQuery,
            int page,
            int? typeId = null
        );
    }
}
