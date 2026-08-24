using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.WebApi.Controller
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [AllowAnonymous]
    public class HomeController(IEventService eventService, IEventTypeService eventTypeService)
        : BaseController
    {
        private readonly IEventService _eventService = eventService;
        private readonly IEventTypeService _eventTypeService = eventTypeService;

        [HttpGet]
        public async Task<IActionResult> GetAttEvents(
            [FromQuery] int page = 1,
            [FromQuery] int? typeId = null
        )
        {
            List<HomePageEvent> events = await _eventService.GetEventsAsync(page, typeId);
            bool hasNextPage = await _eventService.HasNextPageAsync(page, typeId);

            return Success(
                new PaginatedResponse<HomePageEvent> { Data = events, HasNextPage = hasNextPage }
            );
        }

        [HttpGet]
        public async Task<IActionResult> SearchEvents(
            [FromQuery] string? searchQuery,
            [FromQuery] int page = 1,
            [FromQuery] int? typeId = null
        )
        {
            if (page < 1)
                page = 1;

            if (string.IsNullOrWhiteSpace(searchQuery))
            {
                return Success(
                    new PaginatedResponse<HomePageEvent> { Data = [], HasNextPage = false }
                );
            }

            List<HomePageEvent> events = await _eventService.SearchEventsAsync(
                searchQuery, page, typeId
            );
            bool hasNextPage = await _eventService.HasSearchNextPageAsync(
                searchQuery, page, typeId
            );

            return Success(
                new PaginatedResponse<HomePageEvent> { Data = events, HasNextPage = hasNextPage }
            );
        }

        [HttpGet]
        public async Task<IActionResult> GetEventTypes()
        {
            List<EventTypeDto> types = await _eventTypeService.GetActiveEventTypesAsync();
            return Success(types);
        }
    }
}