using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.WebApi.Controller;

[ApiController]
[Route("api/[controller]/[action]")]
[AllowAnonymous]
public class EventBookingController(IEventService eventService) : BaseController
{
    private readonly IEventService _eventService = eventService;

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<EventForBooking>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Event(int id)
    {
        if (id < 0)
            return BadRequest();
        EventForBooking response = await _eventService.GetEventForBooking(id);
        return Success(response);
    }
}
