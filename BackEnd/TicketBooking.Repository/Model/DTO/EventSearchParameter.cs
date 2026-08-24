namespace TicketBooking.Repository.Model.DTO
{
    public class EventSearchParameter
    {
   
        public string SortColumn { get; set; } = "eventDate";
        public string SortDir { get; set; } = "asc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;

       
    }
}
