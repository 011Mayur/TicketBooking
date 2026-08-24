using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Entity;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class EventCategoryManagementService(IEventCategoryRepository repository)
        : IEventCategoryManagementService
    {
        private readonly IEventCategoryRepository _repository = repository;

        public async Task<List<EventCategoryListDto>> GetCategoriesByEventTypeAsync(int eventTypeId)
        {
            return await _repository.GetCategoriesByEventTypeAsync(eventTypeId);
        }

        public async Task<EventCategoryListDto?> GetEventCategoryByIdAsync(int id)
        {
            EventCategory? category = await _repository.GetEventCategoryByIdAsync(id);
            if (category == null)
                throw new ResourceNotFoundException(nameof(EventCategory), id);

            (bool canDelete, string reason, int activeCount, int pastCount) =
                await _repository.CheckEventCategoryDeletabilityAsync(id);
            return new EventCategoryListDto
            {
                Id = category.Id,
                Name = category.Name,
                EventTypeId = category.EventTypeId,
                ActiveEventCount = activeCount,
                PastEventCount = pastCount,
                CanDelete = canDelete,
                DeletionReason = reason,
                CreatedAt = category.CreatedAt,
            };
        }

        public async Task<int> CreateEventCategoryAsync(EventCategoryCreateUpdateDto dto)
        {
            return await _repository.CreateEventCategoryAsync(dto.Name, dto.EventTypeId);
        }

        public async Task UpdateEventCategoryAsync(int id, EventCategoryCreateUpdateDto dto)
        {
            bool updated = await _repository.UpdateEventCategoryAsync(id, dto.Name);
            if (!updated)
                throw new ResourceNotFoundException(nameof(EventCategory), id);
        }

        public async Task DeleteEventCategoryAsync(int id)
        {
            (bool canDelete, string reason, int activeCount, _) =
                await _repository.CheckEventCategoryDeletabilityAsync(id);

            if (!canDelete)
                throw new BusinessRuleException(reason);

            bool deleted = await _repository.SoftDeleteEventCategoryAsync(id);

            if (!deleted)
                throw new BusinessRuleException(ExceptionMessage.FailedDeleteCategory);
        }

        public async Task<List<PastEventDto>> GetPastEventsByCategoryAsync(int categoryId)
        {
            return await _repository.GetPastEventsByCategoryAsync(categoryId);
        }
    }
}
