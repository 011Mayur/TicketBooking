using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TicketBooking.Repository.Model.DTO;

namespace TicketBooking.Service.Service.Interface
{
    public interface ICouponService
    {
        Task<int> CreateCouponAsync(CouponCreateDto dto);
        Task<List<CouponResponseDto>> GetAllCouponsAsync();
        Task UpdateCouponAsync(CouponUpdateDto dto);
        Task TogglCouponStatusAsync(int id);

        Task<CouponResponseDto?> GetCouponByIdAsync(int id);

        Task<List<CouponResponseDto>> GetAllActiveCouponsAsync();
    }
}
