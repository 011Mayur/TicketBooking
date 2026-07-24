using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TicketBooking.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddUserTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase().Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder
                .CreateTable(
                    name: "users",
                    columns: table => new
                    {
                        id = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        first_name = table
                            .Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        last_name = table
                            .Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        password_hash = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        gender = table.Column<int>(type: "int", nullable: false),
                        role = table.Column<int>(type: "int", nullable: false),
                        date_of_birth = table.Column<DateTime>(
                            type: "datetime(6)",
                            nullable: false
                        ),
                        mobile_number = table
                            .Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        email = table
                            .Column<string>(type: "varchar(320)", maxLength: 320, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        is_active = table.Column<bool>(type: "tinyint(1)", nullable: false),
                        created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                        updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("pk_users", x => x.id);
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "users");
        }
    }
}
