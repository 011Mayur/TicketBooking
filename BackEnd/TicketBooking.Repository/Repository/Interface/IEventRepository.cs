using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
            EventSearchParameter query
        );
        Task<EventPosterDto?> GetEventPosterByIdAsync(int id);
    }
}
