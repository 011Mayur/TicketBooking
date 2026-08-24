using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TicketBooking.Repository.Migrations
{
    /// <inheritdoc />
    public partial class BookingLockSnaps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "bulk_discount_amount",
                table: "booking_locks",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "bulk_discount_percentage",
                table: "booking_locks",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "coupon_code",
                table: "booking_locks",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "coupon_discount_amount",
                table: "booking_locks",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "coupon_discount_percentage",
                table: "booking_locks",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "coupon_id",
                table: "booking_locks",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "discount_type",
                table: "booking_locks",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "final_amount",
                table: "booking_locks",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "sub_total",
                table: "booking_locks",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "unit_price",
                table: "booking_locks",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "bulk_discount_amount",
                table: "booking_locks");

            migrationBuilder.DropColumn(
                name: "bulk_discount_percentage",
                table: "booking_locks");

            migrationBuilder.DropColumn(
                name: "coupon_code",
                table: "booking_locks");

            migrationBuilder.DropColumn(
                name: "coupon_discount_amount",
                table: "booking_locks");

            migrationBuilder.DropColumn(
                name: "coupon_discount_percentage",
                table: "booking_locks");

            migrationBuilder.DropColumn(
                name: "coupon_id",
                table: "booking_locks");

            migrationBuilder.DropColumn(
                name: "discount_type",
                table: "booking_locks");

            migrationBuilder.DropColumn(
                name: "final_amount",
                table: "booking_locks");

            migrationBuilder.DropColumn(
                name: "sub_total",
                table: "booking_locks");

            migrationBuilder.DropColumn(
                name: "unit_price",
                table: "booking_locks");
        }
    }
}
