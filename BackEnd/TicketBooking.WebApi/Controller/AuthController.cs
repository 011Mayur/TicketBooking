using Microsoft.AspNetCore.Mvc;
using TicketBooking.Repository.Common;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;
using TicketBooking.WebApi.Constant;

namespace TicketBooking.WebApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IUserService userService, IJwtService jwtService) : ControllerBase
    {
        private readonly IUserService _userService = userService;
        private readonly IJwtService _jwtService = jwtService;

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto user)
        {
            try
            {
                int id = await _userService.AddUserAsync(user);
                return StatusCode(StatusCodes.Status201Created, new { id });
            }
            catch (DuplicateFieldException ex)
            {
                return Conflict(new { field = ex.Field, message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto login)
        {
            UserLoginResponseDto? user = await _userService.ValidateUserAsync(login);

            if (user is null)
                return Unauthorized(new { message = ApiMessage.InvalidEmailPassword });

            string token = _jwtService.GenerateToken(user);

            CookieOptions cookieOptions = new()
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddMinutes(60),
            };

            Response.Cookies.Append("access_token", token, cookieOptions);

            return Ok(
                new
                {
                    message = ApiMessage.LoginSuccessful,
                    userId = user.Id,
                    role = user.Role.ToString(),
                }
            );
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("access_token");
            return Ok(new { message = ApiMessage.LogOutSuccessful });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            await _userService.RequestPasswordResetAsync(dto.Email);
            return Ok(new { message = ApiMessage.RestLinkSent });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            bool success = await _userService.ResetPasswordAsync(dto.Token, dto.NewPassword);

            if (!success)
                return BadRequest(new { message = ApiMessage.InvalidResetLink });

            return Ok(new { message = ApiMessage.PasswordReset });
        }
    }
}
