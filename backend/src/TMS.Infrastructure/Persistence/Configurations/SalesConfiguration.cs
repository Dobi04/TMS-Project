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
            builder.Property(sale => sale.QuantitySold).IsRequired();
            builder.Property(sale => sale.SalePriceByUnit).IsRequired();
            builder.Property(sale => sale.SaleDate).IsRequired();
            builder.Property(sale => sale.DestinationMarket).IsRequired().HasMaxLength(100);

            builder.HasIndex(sale => sale.TyreId);
        }
    }
}