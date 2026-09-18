using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdditionToSaleTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PurcesingCompany",
                table: "Sales",
                type: "varchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "SuperVisorId",
                table: "Sales",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "UnitOfMesure",
                table: "Sales",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "isActive",
                table: "Sales",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sales_SuperVisorId",
                table: "Sales",
                column: "SuperVisorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sales_SuperVisorId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "PurcesingCompany",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "SuperVisorId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "UnitOfMesure",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "isActive",
                table: "Sales");
        }
    }
}
