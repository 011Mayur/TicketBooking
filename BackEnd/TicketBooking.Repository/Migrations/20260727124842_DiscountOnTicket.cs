using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TicketBooking.Repository.Migrations
{
    /// <inheritdoc />
    public partial class DiscountOnTicket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "bulk_ticket_for_discont",
                table: "events",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "discount_percentage",
                table: "events",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "bulk_ticket_for_discont",
                table: "events");

            migrationBuilder.DropColumn(
                name: "discount_percentage",
                table: "events");
        }
    }
}
