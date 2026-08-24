namespace TicketBooking.Repository.Common
{
    public enum Role
    {
        Admin = 0,
        User = 1,
    }

    public enum Gender
    {
        Male = 0,
        Female = 1,
    }

    public enum BookingStatus
    {
        Pending,
        Paid,
        Failed,
        Expired,
        Cancelled,
    }

    public enum BookingDiscountType
    {
        None,
        Bulk,
        Coupon,
    }
}
