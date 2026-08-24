namespace TicketBooking.Repository.Common
{
    public class BusinessException : Exception
    {
        public BusinessException(string message)
            : base(message) { }

        public BusinessException(string message, Exception innerException)
            : base(message, innerException) { }
    }

    public class ResourceNotFoundException : BusinessException
    {
        public string? ResourceType { get; set; }
        public object? ResourceId { get; set; }

        public ResourceNotFoundException(string message)
            : base(message) { }

        public ResourceNotFoundException(string resourceType, object resourceId)
            : base($"{resourceType} with id '{resourceId}' not found.")
        {
            ResourceType = resourceType;
            ResourceId = resourceId;
        }
    }

    public class DuplicateFieldException : BusinessException
    {
        public string Field { get; set; }

        public DuplicateFieldException(string field, string value)
            : base($"{field} '{value}' already exists.")
        {
            Field = field;
        }
    }

    public class BusinessRuleException : BusinessException
    {
        public BusinessRuleException(string message)
            : base(message) { }
    }

    public class ValidationException : BusinessException
    {
        public Dictionary<string, string[]> Errors { get; set; } = [];

        public ValidationException(string message)
            : base(message) { }

        public ValidationException(Dictionary<string, string[]> errors)
            : base("Validation failed")
        {
            Errors = errors;
        }
    }
}
