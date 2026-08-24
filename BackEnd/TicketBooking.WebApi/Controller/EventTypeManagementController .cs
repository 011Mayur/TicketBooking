using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;
using TicketBooking.WebApi.Constant;

namespace TicketBooking.WebApi.Controller
{
    [ApiController]
    [Route("api/event-management")]
    [Authorize(Roles = nameof(Role.Admin))]
    public class EventTypeManagementController(
        IEventTypeService eventTypeService,
        IEventCategoryManagementService eventCategoryService
    ) : BaseController
    {
        private readonly IEventTypeService _eventTypeService = eventTypeService;
        private readonly IEventCategoryManagementService _eventCategoryService =
            eventCategoryService;

        [HttpGet("types")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetEventTypes()
        {
            List<EventTypeListDto>? types = await _eventTypeService.GetAllEventTypesAsync();
            return Success(types);
        }

        [HttpGet("types/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetEventTypeById(int id)
        {
            EventTypeListDto? type = await _eventTypeService.GetEventTypeByIdAsync(id);
            return SuccessCreated(
                nameof(GetEventTypeById),
                new { id },
                new { id },
                ApiMessage.EventTypeCreated
            );
        }

        [HttpPost("types")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateEventType([FromBody] EventTypeCreateUpdateDto dto)
        {
            int id = await _eventTypeService.CreateEventTypeAsync(dto);
            return SuccessCreated(
                nameof(GetEventTypeById),
                new { id },
                new { id },
                ApiMessage.EventTypeCreated
            );
        }

        [HttpPut("types/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateEventType(
            int id,
            [FromBody] EventTypeCreateUpdateDto dto
        )
        {
            await _eventTypeService.UpdateEventTypeAsync(id, dto);
            return Success(ApiMessage.EventTypeUpdated);
        }

        [HttpDelete("types/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status422UnprocessableEntity)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteEventType(int id)
        {
            await _eventTypeService.DeleteEventTypeAsync(id);
            return Success(ApiMessage.EventTypeDeleted);
        }

        [HttpGet("types/{typeId}/categories")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCategoriesByType(int typeId)
        {
            List<EventCategoryListDto>? categories =
                await _eventCategoryService.GetCategoriesByEventTypeAsync(typeId);
            return Success(categories);
        }

        [HttpGet("categories/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _eventCategoryService.GetEventCategoryByIdAsync(id);
            return Success(category);
        }

        [HttpPost("categories")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateCategory([FromBody] EventCategoryCreateUpdateDto dto)
        {
            int id = await _eventCategoryService.CreateEventCategoryAsync(dto);
            return SuccessCreated(
                nameof(GetCategoryById),
                new { id },
                new { id },
                ApiMessage.CategoryCreated
            );
        }

        [HttpPut("categories/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateCategory(
            int id,
            [FromBody] EventCategoryCreateUpdateDto dto
        )
        {
            await _eventCategoryService.UpdateEventCategoryAsync(id, dto);
            return Success(ApiMessage.CategoryUpdated);
        }

        [HttpDelete("categories/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status422UnprocessableEntity)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            await _eventCategoryService.DeleteEventCategoryAsync(id);
            return Success(ApiMessage.CategoryDeleted);
        }

        [HttpGet("categories/{categoryId}/past-events")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPastEventsByCategory(int categoryId)
        {
            List<PastEventDto>? events = await _eventCategoryService.GetPastEventsByCategoryAsync(
                categoryId
            );
            return Success(events);
        }
    }
}
