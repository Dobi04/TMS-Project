using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncPropertyRenamesAndPriceType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "isEmailVerified",
                table: "User",
                newName: "IsEmailVerified");

            migrationBuilder.RenameColumn(
                name: "isActive",
                table: "User",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "isActive",
                table: "Tyre",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "isActive",
                table: "Sales",
                newName: "IsActive");

            migrationBuilder.RenameColumn(
                name: "isActive",
                table: "Machine",
                newName: "IsActive");

            migrationBuilder.AlterColumn<decimal>(
                name: "SalePriceByUnit",
                table: "Sales",
                type: "decimal(65,30)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "double");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsEmailVerified",
                table: "User",
                newName: "isEmailVerified");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "User",
                newName: "isActive");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "Tyre",
                newName: "isActive");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "Sales",
                newName: "isActive");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "Machine",
                newName: "isActive");

            migrationBuilder.AlterColumn<double>(
                name: "SalePriceByUnit",
                table: "Sales",
                type: "double",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)");
        }
    }
}
