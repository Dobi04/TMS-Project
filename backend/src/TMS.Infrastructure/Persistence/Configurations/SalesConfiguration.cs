using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Domain.Entities;

namespace TMS.Infrastructure.Persistence.Configurations
{
    public class SalesConfiguration : IEntityTypeConfiguration<Sales>
    {
        public void Configure(EntityTypeBuilder<Sales> builder)
        {
            builder.ToTable("Sales");

            builder.HasKey(sale => sale.Id);
            builder.Property(sale => sale.TyreId).IsRequired();
            builder.Property(sale => sale.RegisteredById).IsRequired().HasColumnName("SuperVisorId");
            builder.Property(sale => sale.QuantitySold).IsRequired();
            builder.Property(sale => sale.UnitOfMeasure).IsRequired().HasMaxLength(20).HasColumnName("UnitOfMesure");
            builder.Property(sale => sale.SalePriceByUnit).IsRequired();
            builder.Property(sale => sale.SaleDate).IsRequired();
            builder.Property(sale => sale.PurchasingCompany).IsRequired().HasMaxLength(150).HasColumnName("PurcesingCompany");
            builder.Property(sale => sale.DestinationMarket).IsRequired().HasMaxLength(100);
            builder.Property(sale => sale.IsActive).IsRequired().HasDefaultValue(true);

            builder.HasIndex(sale => sale.TyreId);
            builder.HasIndex(sale => sale.RegisteredById).HasDatabaseName("IX_Sales_SuperVisorId");
        }
    }
}