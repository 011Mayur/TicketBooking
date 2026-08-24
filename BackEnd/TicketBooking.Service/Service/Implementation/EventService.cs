using Microsoft.Extensions.Logging;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class EventService(
        IEventRepository eventRepo,
        IImageUploadService imageUploadService,
        ILogger<EventService> logger
    ) : IEventService
    {
        private readonly IEventRepository _eventRepo = eventRepo;
        private readonly IImageUploadService _imageUploadService = imageUploadService;
        private readonly ILogger<EventService> _logger = logger;

        private static readonly string[] AllowedSortColumns =
        [
            "title",
            "artistName",
            "venue",
            "eventDate",
            "ticketPrice",
            "totalSeats",
        ];

        public async Task<int> CreateEventAsync(EventCreateDto dto)
        {
            if (dto.EventDate.Date < DateTime.UtcNow.Date)
                throw new ValidationException(ExceptionMessage.PastEventData);

            return await _eventRepo.CreateEventAsync(dto);
        }

        public Task<EventResponseDto?> GetEventByIdAsync(int id) =>
            _eventRepo.GetEventByIdAsync(id);

        public async Task UpdateEventAsync(EventUpdateDto dto)
        {
            if (dto.EventDate.Date < DateTime.UtcNow.Date)
                throw new ValidationException(ExceptionMessage.PastEventData);
            EventPosterDto? oldPoster = await _eventRepo.GetEventPosterByIdAsync(dto.Id);

            if (
                !string.IsNullOrEmpty(oldPoster?.PosterImageUrl)
                && oldPoster.PosterImageUrl != dto.PosterImageUrl
            )
            {
                try
                {
                    await _imageUploadService.DeleteImageAsync(oldPoster.PosterImageUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(
                        ex,
                        "Failed to delete old poster from Cloudinary for event {EventId}. Old URL: {OldUrl}",
                        dto.Id,
                        oldPoster.PosterImageUrl
                    );
                }
            }

            try
            {
                int rowsAffected = await _eventRepo.UpdateEventAsync(dto);

                if (rowsAffected == 0)
                {
                    _logger.LogError("Event update returned 0 rows for event ID {EventId}", dto.Id);
                    throw new ResourceNotFoundException("Event", dto.Id);
                }
                _logger.LogInformation("Event {EventId} updated successfully", dto.Id);
            }
            catch (BusinessRuleException ex)
            {
                _logger.LogWarning(
                    ex,
                    "Business rule violation when updating event {EventId}: {Message}",
                    dto.Id,
                    ex.Message
                );
                throw;
            }
        }

        public async Task<List<HomePageEvent>> GetEventsAsync(int page, int? typeId = null)
        {
            return await _eventRepo.GetEventsAsync(page, typeId);
        }

        public async Task<bool> HasNextPageAsync(int page, int? typeId = null)
        {
            return await _eventRepo.HasNextPageAsync(page, typeId);
        }

        public async Task<EventForBooking> GetEventForBooking(int id)
        {
            EventForBooking? result = await _eventRepo.GetEventForBooking(id);
            if (result is null)
                throw new ResourceNotFoundException(ExceptionMessage.ResourceNotFound(id, "Event"));

            return result;
        }

        public Task DeleteEventAsync(int id) => _eventRepo.DeleteEventAsync(id);

        public async Task<PagedResult<EventResponseDto>> GetPagedEventsAsync(
            EventSearchParameter query,
            int categoryId
        )
        {
            if (!AllowedSortColumns.Contains(query.SortColumn))
                throw new ValidationException($"Invalid sort column '{query.SortColumn}'.");

            query.Page = Math.Max(query.Page, 1);
            query.PageSize = Math.Clamp(query.PageSize, 1, 100);

            (List<EventResponseDto> items, int totalCount) = await _eventRepo.GetPagedEventsAsync(
                query,
                categoryId
            );

            return new PagedResult<EventResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize,
            };
        }

        public async Task<List<HomePageEvent>> SearchEventsAsync(
            string? searchQuery,
            int page,
            int? typeId = null
        )
        {
            return await _eventRepo.SearchEventsAsync(searchQuery, page, typeId);
        }

        public async Task<bool> HasSearchNextPageAsync(
            string? searchQuery,
            int page,
            int? typeId = null
        )
        {
            return await _eventRepo.HasSearchNextPageAsync(searchQuery, page, typeId);
        }
    }
}
