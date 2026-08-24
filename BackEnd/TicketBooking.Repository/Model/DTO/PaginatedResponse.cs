namespace TicketBooking.Repository.Model.DTO
{
    public class PaginatedResponse<T>
    {
        public List<T> Data { get; set; } = [];
        public bool HasNextPage { get; set; }
    }
}
