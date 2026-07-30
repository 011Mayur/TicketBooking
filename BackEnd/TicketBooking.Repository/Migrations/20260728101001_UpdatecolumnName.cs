using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TicketBooking.Repository.Migrations
{
    /// <inheritdoc />
    public partial class UpdatecolumnName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "bulk_ticket_for_discont",
                table: "events",
                newName: "bulk_ticket_for_discount"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "bulk_ticket_for_discount",
                table: "events",
                newName: "bulk_ticket_for_discont"
            );
        }
    }
}
