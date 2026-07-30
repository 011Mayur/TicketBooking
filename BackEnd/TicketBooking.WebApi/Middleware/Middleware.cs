using System.Text.Json;
using MySql.Data.MySqlClient;
using TicketBooking.Repository.Common;

namespace TicketBooking.WebApi.Middleware
{
    public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        private readonly RequestDelegate _next = next;
        private readonly ILogger<ExceptionMiddleware> _logger = logger;

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            if (context.Response.HasStarted)
            {
                _logger.LogError(ex, "Exception after response started");
                throw ex;
            }

            var response = MapException(ex);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = response.StatusCode;

            await context.Response.WriteAsync(JsonSerializer.Serialize(response.Body));
        }

        private (int StatusCode, object Body) MapException(Exception ex)
        {
            return ex switch
            {
           
                DuplicateFieldException dup => (
                    StatusCodes.Status409Conflict,
                    (object)
                        new
                        {
                            field = dup.Field,
                            message = dup.Message,
                            errorCode = "DUPLICATE_FIELD",
                        }
                ),

                ResourceNotFoundException notFound => (
                    StatusCodes.Status404NotFound,
                    new
                    {
                        message = notFound.Message,
                        resourceType = notFound.ResourceType,
                        resourceId = notFound.ResourceId,
                        errorCode = "RESOURCE_NOT_FOUND",
                    }
                ),

                ValidationException val => (
                    StatusCodes.Status400BadRequest,
                    (object)
                        new
                        {
                            message = val.Message,
                            errors = val.Errors ?? new(),
                            errorCode = "VALIDATION_FAILED",
                        }
                ),

                BusinessRuleException businessRule => (
                    StatusCodes.Status422UnprocessableEntity,
                    new { message = businessRule.Message, errorCode = "BUSINESS_RULE_VIOLATION" }
                ),

                ArgumentException argEx => (
                    StatusCodes.Status400BadRequest,
                    new { message = argEx.Message, errorCode = "INVALID_ARGUMENT" }
                ),

                MySqlException sqlEx => (
                    StatusCodes.Status500InternalServerError,
                    new { message = "A database error occurred.", errorCode = "DATABASE_ERROR" }
                ),

                _ => (
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "An unexpected error occurred.",
                        errorCode = "INTERNAL_SERVER_ERROR",
                    }
                ),
            };
        }
    }
}
