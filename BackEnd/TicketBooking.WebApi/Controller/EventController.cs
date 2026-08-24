using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;
using TicketBooking.WebApi.Constant;

namespace TicketBooking.WebApi.Controller
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [Authorize(Roles = nameof(Role.Admin))]
    public class EventController(IEventService eventService, IImageUploadService imageUploadService)
        : BaseController
    {
        private readonly IEventService _eventService = eventService;

        private readonly IImageUploadService _imageUploadService = imageUploadService;

        [HttpPost]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] EventCreateDto dto)
        {
            int id = await _eventService.CreateEventAsync(dto);
            return StatusCode(201, new { id });
        }

        [HttpGet("{id}")]
        [ProducesResponseType(
            typeof(ApiResponse<PagedResult<EventResponseDto>>),
            StatusCodes.Status200OK
        )]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPaged([FromQuery] EventSearchParameter query, int id)
        {
            PagedResult<EventResponseDto>? result = await _eventService.GetPagedEventsAsync(
                query,
                id
            );
            return Success(result, ApiMessage.EventFetched);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            EventResponseDto? evt = await _eventService.GetEventByIdAsync(id);
            return evt is null ? NotFound() : Success(evt, ApiMessage.EventFetched);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] EventUpdateDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "ID mismatch." });

            await _eventService.UpdateEventAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _eventService.DeleteEventAsync(id);
            return NoContent();
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadPosterImage(IFormFile file)
        {
            string url = await _imageUploadService.UploadEventPosterAsync(file);
            return Success(new { url }, ApiMessage.ImageUploaded);
        }
    }
}
