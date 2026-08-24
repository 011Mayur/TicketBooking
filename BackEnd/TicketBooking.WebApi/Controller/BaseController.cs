using Microsoft.AspNetCore.Mvc;

namespace TicketBooking.WebApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseController : ControllerBase
    {
        public IActionResult Success<T>(T data, string message = "Data Fetched Successfully")
        {
            return Ok(
                new ApiResponse<T>
                {
                    Success = true,
                    Message = message,
                    Data = data,
                }
            );
        }

        protected IActionResult Success(string message = "Operation completed successfully")
        {
            return Ok(
                new ApiResponse<object>
                {
                    Success = true,
                    Message = message,
                    Data = null,
                }
            );
        }

        protected IActionResult SuccessCreated<T>(
            string actionName,
            object routeValues,
            T data,
            string message = "Resource created successfully"
        )
        {
            var response = new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data,
            };
            return CreatedAtAction(actionName, routeValues, response);
        }
    }
}
