using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Service.Service.Interface
{
    public interface IEventService
    {
         Task<int> CreateEventAsync(EventCreateDto dto);
        Task<EventResponseDto?> GetEventByIdAsync(int id);
        Task UpdateEventAsync(EventUpdateDto dto);
        Task DeleteEventAsync(int id);
        Task<PagedResult<EventResponseDto>> GetPagedEventsAsync(EventSearchParameter query);

    }
}