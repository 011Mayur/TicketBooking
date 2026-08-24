using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Repository.Repository.Interface
{
    public interface ICouponRepository
    {
        Task<int> CreateCouponAsync(CouponCreateDto dto);
        Task<List<CouponResponseDto>> GetAllCouponsAsync();
        Task<CouponResponseDto?> GetCouponByIdAsync(int id);
        Task UpdateCouponAsync(CouponUpdateDto dto);
        Task TogglCouponStatusAsync(int id);
        Task<bool> HasUserUsedCouponAsync(int couponId, int userId);

        Task<List<CouponResponseDto>> GetAllActiveCouponsAsync();

        Task<CouponValidationDto?> GetCouponForValidationAsync(
            string code,
            int eventId,
            int userId
        );
    }
}
