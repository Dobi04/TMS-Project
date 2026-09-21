using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Domain.Entities;

namespace TMS.Infrastructure.Persistence.Configurations
{
    public class TyreConfiguration : IEntityTypeConfiguration<Tyre>
    {
        public void Configure(EntityTypeBuilder<Tyre> builder)
        {
            builder.ToTable("Tyre");

            builder.HasKey(tyre => tyre.Id);
            builder.Property(tyre => tyre.Code).IsRequired().HasMaxLength(50);
            builder.Property(tyre => tyre.QuantityProduced).IsRequired();
            builder.Property(tyre => tyre.OperatorId).IsRequired();
            builder.Property(tyre => tyre.ProductionDate).IsRequired();
            builder.Property(tyre => tyre.ProductionShift)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();
            builder.Property(tyre => tyre.MachineNumber).IsRequired();
            builder.Property(tyre => tyre.IsActive).IsRequired().HasDefaultValue(true);

            builder.HasIndex(tyre => tyre.Code).IsUnique();
            builder.HasIndex(tyre => tyre.MachineNumber);
            builder.HasIndex(tyre => tyre.OperatorId);
        }
    }
}