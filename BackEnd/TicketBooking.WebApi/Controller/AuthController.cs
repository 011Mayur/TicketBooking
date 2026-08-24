using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketBooking.Repository.Model.DTO;
using TicketBooking.Service.Service.Interface;
using TicketBooking.WebApi.Constant;
using TicketBooking.WebApi.DTO;

namespace TicketBooking.WebApi.Controller
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(
        IUserService userService,
        IJwtService jwtService,
        IConfiguration configuration
    ) : BaseController
    {
        private readonly IUserService _userService = userService;
        private readonly IJwtService _jwtService = jwtService;
        private readonly IConfiguration _configuration = configuration;

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto user)
        {
            int id = await _userService.AddUserAsync(user);
            return StatusCode(StatusCodes.Status201Created, new { id });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto login)
        {
            UserLoginResponseDto? user = await _userService.ValidateUserAsync(login);
            int accessTokenExpiry = _configuration.GetValue<int>("jwt:AccessTokenExpiryMinutes");
            int refreshTokenExpiry = _configuration.GetValue<int>("jwt:RefreshTokenExpiryDays");

            if (user is null)
                return Unauthorized(
                    new ApiErrorResponse
                    {
                        Message = ApiMessage.InvalidEmailPassword,
                        ErrorCode = "INVALID_CREDENTIALS",
                    }
                );

            string accessToken = _jwtService.GenerateToken(user);
            string refreshToken = await _userService.CreateRefreshTokenAsync(user.Id);

           

            CookieOptions accessCookie = new()
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddMinutes(accessTokenExpiry),
            };

            Response.Cookies.Append("access_token", accessToken, accessCookie);

            CookieOptions refreshCookie = new()
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(refreshTokenExpiry),
            };
            Response.Cookies.Append("refresh_token", refreshToken, refreshCookie);

            return Ok(
                new
                {
                    message = ApiMessage.LoginSuccessful,
                    userId = user.Id,
                    role = user.Role.ToString(),
                }
            );
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            if (!Request.Cookies.TryGetValue("refresh_token", out var refreshToken))
                return Unauthorized(new { message = "Refresh token missing" });
            int accessTokenExpiry = _configuration.GetValue<int>("jwt:AccessTokenExpiryMinutes");

            RefreshTokenDto? validToken = await _userService.ValidateRefreshTokenAsync(
                refreshToken
            );

            if (validToken is null)
                return Unauthorized(new { message = "Refresh token expired or invalid" });

            UserLoginResponseDto? user = await _userService.GetUserByIdAsync(validToken.UserId);
            if (user is null)
                return Unauthorized(new { message = "User not found" });

            string newAccessToken = _jwtService.GenerateToken(user);

            CookieOptions? accessCookie = new()
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddMinutes(accessTokenExpiry),
            };
            Response.Cookies.Append("access_token", newAccessToken, accessCookie);

            return Ok(new { message = "Token refreshed" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            if (Request.Cookies.TryGetValue("refresh_token", out var refreshToken))
            {
                await _userService.DeleteRefreshTokenAsync(refreshToken);
            }

            Response.Cookies.Delete("access_token");
            Response.Cookies.Delete("refresh_token");
            return Success(ApiMessage.LogOutSuccessful );
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            await _userService.RequestPasswordResetAsync(dto.Email);
            return Ok(new { message = ApiMessage.RestLinkSent });
        }

        [Authorize]
        [HttpGet("current-user")]
        public IActionResult GetCurrentUser()
        {
            CurrentUserResponse userData = new()
            {
                Id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
                Email = User.FindFirstValue(ClaimTypes.Email),
                FirstName = User.FindFirstValue(ClaimTypes.GivenName),
                LastName = User.FindFirstValue(ClaimTypes.Surname),
                Role = User.FindFirstValue(ClaimTypes.Role),
            };
            return Success(userData, ApiMessage.CurrentUserRetrive);
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
