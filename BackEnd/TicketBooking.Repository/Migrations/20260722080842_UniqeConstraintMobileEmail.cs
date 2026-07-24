using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TicketBooking.Repository.Migrations
{
    /// <inheritdoc />
    public partial class UniqeConstraintMobileEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_users_mobile_number",
                table: "users",
                column: "mobile_number",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "ix_users_email", table: "users");

            migrationBuilder.DropIndex(name: "ix_users_mobile_number", table: "users");
        }
    }
}
