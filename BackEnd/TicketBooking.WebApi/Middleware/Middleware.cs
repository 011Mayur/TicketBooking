using System.Text.Json;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using TicketBooking.Repository.Common;

namespace TicketBooking.WebApi.Middleware
{
    public class ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IOptions<JsonOptions> jsonOptions
    )
    {
        private readonly RequestDelegate _next = next;
        private readonly ILogger<ExceptionMiddleware> _logger = logger;

        private readonly JsonSerializerOptions _jsonOptions = jsonOptions.Value.SerializerOptions;

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");

                if (context.Response.HasStarted)
                {
                    _logger.LogError(ex, "Exception after response started");
                    throw;
                }

                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            (int StatusCode, object Body) = MapException(ex);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCode;

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(Body, _jsonOptions)
            );
        }

        private (int StatusCode, object Body) MapException(Exception ex)
        {
            return ex switch
            {
                DuplicateFieldException dup => (
                    StatusCodes.Status409Conflict,
                    new ApiErrorResponse
                    {
                        Message = dup.Message,
                        ErrorCode = "DUPLICATE_FIELD",
                        Details = new { dup.Field },
                    }
                ),

                ResourceNotFoundException notFound => (
                    StatusCodes.Status404NotFound,
                    new ApiErrorResponse
                    {
                        Message = notFound.Message,
                        ErrorCode = "RESOURCE_NOT_FOUND",
                        Details = new { notFound.ResourceType, notFound.ResourceId },
                    }
                ),

                ValidationException val => (
                    StatusCodes.Status400BadRequest,
                    new ApiErrorResponse
                    {
                        Message = val.Message,
                        ErrorCode = "VALIDATION_FAILED",
                        Errors = val.Errors ?? [],
                    }
                ),

                BusinessRuleException businessRule => (
                    StatusCodes.Status422UnprocessableEntity,
                    new ApiErrorResponse
                    {
                        Message = businessRule.Message,
                        ErrorCode = "BUSINESS_RULE_VIOLATION",
                    }
                ),

                ArgumentException argEx => (
                    StatusCodes.Status400BadRequest,
                    new ApiErrorResponse { Message = argEx.Message, ErrorCode = "INVALID_ARGUMENT" }
                ),

                MySqlException sqlEx => (
                    StatusCodes.Status500InternalServerError,
                    new ApiErrorResponse
                    {
                        Message = "A database error occurred.",
                        ErrorCode = "DATABASE_ERROR",
                    }
                ),

                _ => (
                    StatusCodes.Status500InternalServerError,
                    new ApiErrorResponse
                    {
                        Message = "An unexpected error occurred.",
                        ErrorCode = "INTERNAL_SERVER_ERROR",
                    }
                ),
            };
        }
    }
}
