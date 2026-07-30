using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.WebApi.Controller
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [Authorize(Roles = nameof(Role.Admin))]
    public class EventController(IEventService eventService, IImageUploadService imageUploadService)
        : ControllerBase
    {
        private readonly IEventService _eventService = eventService;

        private readonly IImageUploadService _imageUploadService = imageUploadService;

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EventCreateDto dto)
        {
            int id = await _eventService.CreateEventAsync(dto);
            return StatusCode(201, new { id });
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPaged([FromQuery] EventSearchParameter query)
        {
            PagedResult<EventResponseDto>? result = await _eventService.GetPagedEventsAsync(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            EventResponseDto? evt = await _eventService.GetEventByIdAsync(id);
            return evt is null ? NotFound() : Ok(evt);
        }

        [HttpPut("{id}")]
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
        public async Task<IActionResult> UploadPosterImage(IFormFile file)
        {
            string url = await _imageUploadService.UploadEventPosterAsync(file);
            return Ok(new { url });
        }
    }
}
