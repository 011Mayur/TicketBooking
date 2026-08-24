using MySql.Data.MySqlClient;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Repository.Repository.Interface;
using TicketBooking.Service.Service.Interface;

namespace TicketBooking.Service.Service.Implementation
{
    public class CouponService(ICouponRepository couponRepo) : ICouponService
    {
        private readonly ICouponRepository _couponRepo = couponRepo;

        public async Task<int> CreateCouponAsync(CouponCreateDto dto)
        {
            DateTime CurrentTime = DateTime.UtcNow;
            if (dto.ExpiryDate <= CurrentTime)
                throw new ValidationException(ExceptionMessage.FutureExpiryDate);

            dto.Code = dto.Code.Trim().ToUpperInvariant();
            dto.IsActive = true;

            try
            {
                return await _couponRepo.CreateCouponAsync(dto);
            }
            catch (MySqlException ex) when (ex.Number == 1062)
            {
                throw new DuplicateFieldException("code", ExceptionMessage.DulicateCoupon);
            }
        }

        public Task<List<CouponResponseDto>> GetAllCouponsAsync() =>
            _couponRepo.GetAllCouponsAsync();

        public Task<List<CouponResponseDto>> GetAllActiveCouponsAsync() =>
            _couponRepo.GetAllActiveCouponsAsync();

        public async Task UpdateCouponAsync(CouponUpdateDto dto)
        {
            dto.Code = dto.Code.Trim().ToUpperInvariant();
            try
            {
                await _couponRepo.UpdateCouponAsync(dto);
            }
            catch (MySqlException ex) when (ex.Number == 1062)
            {
                throw new DuplicateFieldException("code", ExceptionMessage.DulicateCoupon);
            }
        }

        public async Task<CouponResponseDto?> GetCouponByIdAsync(int id)
        {
            return await _couponRepo.GetCouponByIdAsync(id);
        }

        public Task TogglCouponStatusAsync(int id) => _couponRepo.TogglCouponStatusAsync(id);

        public async Task<CouponValidationDto> ValidateCouponAsync(
            string code,
            int eventId,
            int userId
        )
        {
            string normalizedCode = code.Trim().ToUpperInvariant(); 
            CouponValidationDto? coupon = await _couponRepo.GetCouponForValidationAsync(
                normalizedCode,
                eventId,
                userId
            );

            if (coupon is null)
                throw new ResourceNotFoundException(ExceptionMessage.CouponNotFound(code));

            if (!coupon.IsActive)
                throw new BusinessRuleException(ExceptionMessage.CouponInactive);

            if (coupon.ExpiryDate <= DateTime.UtcNow)
                throw new BusinessRuleException(ExceptionMessage.CouponExpired);

            if (!coupon.IsLinkedToEvent)
                throw new BusinessRuleException(ExceptionMessage.CouponNotApplicableToEvent);

            if (coupon.AlreadyUsedByUser)
                throw new BusinessRuleException(ExceptionMessage.CouponAlreadyUsed);

            return coupon;
        }
    }
}
