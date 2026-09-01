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
    public class CouponController(ICouponService couponService) : BaseController
    {
        private readonly ICouponService _couponService = couponService;

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CouponCreateDto dto)
        {
            int id = await _couponService.CreateCouponAsync(dto);
            return StatusCode(201, new { id });
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _couponService.GetAllCouponsAsync());

        [HttpGet]
        public async Task<IActionResult> GetAllActive() =>
            Ok(await _couponService.GetAllActiveCouponsAsync());

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CouponUpdateDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = ResponseMessage.IdMismatch });

            await _couponService.UpdateCouponAsync(dto);
            return NoContent();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            CouponResponseDto? result = await _couponService.GetCouponByIdAsync(id);

            if (result is null)
            {
                NotFound();
            }
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> ToggleCouponStatus(int id)
        {
            await _couponService.TogglCouponStatusAsync(id);
            return NoContent();
        }
    }
}
