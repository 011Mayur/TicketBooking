using TicketBooking.Repository.Common;
using TicketBooking.Repository.Entity;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class EventTypeService(IEventTypeRepository eventRepo) : IEventTypeService
    {
        private readonly IEventTypeRepository _eventRepo = eventRepo;

        public async Task<List<EventTypeListDto>> GetAllEventTypesAsync()
        {
            return await _eventRepo.GetAllEventTypesAsync();
        }

        public async Task<EventTypeListDto?> GetEventTypeByIdAsync(int id)
        {
            EventType? type = await _eventRepo.GetEventTypeByIdAsync(id);
            if (type == null)
                throw new ResourceNotFoundException(nameof(EventType), id);

            (bool canDelete, string reason, _) = await _eventRepo.CheckEventTypeDeletabilityAsync(
                id
            );
            return new EventTypeListDto
            {
                Id = type.Id,
                Name = type.Name,
                CanDelete = canDelete,
                DeletionReason = reason,
                CreatedAt = type.CreatedAt,
            };
        }

        public async Task<int> CreateEventTypeAsync(EventTypeCreateUpdateDto dto)
        {
            return await _eventRepo.CreateEventTypeAsync(dto.Name);
        }

        public async Task<bool> UpdateEventTypeAsync(int id, EventTypeCreateUpdateDto dto)
        {
            bool updated = await _eventRepo.UpdateEventTypeAsync(id, dto.Name);
            if (!updated)
                throw new ResourceNotFoundException(nameof(EventType), id);
            return updated;
        }

        public async Task DeleteEventTypeAsync(int id)
        {
            (bool canDelete, string reason, int categoryCount) =
                await _eventRepo.CheckEventTypeDeletabilityAsync(id);

            if (!canDelete)
                throw new BusinessRuleException(reason);

            bool deleted = await _eventRepo.SoftDeleteEventTypeAsync(id);

            if (!deleted)
                throw new BusinessRuleException(ExceptionMessage.EventTypeDelete);
        }

        public Task<List<EventTypeDto>> GetActiveEventTypesAsync() =>
            _eventRepo.GetActiveEventTypesAsync();
    }
}
