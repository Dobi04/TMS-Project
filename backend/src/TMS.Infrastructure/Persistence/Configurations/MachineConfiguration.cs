using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Domain.Entities;

namespace TMS.Infrastructure.Persistence.Configurations
{
    public class MachineConfiguration : IEntityTypeConfiguration<Machine>
    {
        public void Configure(EntityTypeBuilder<Machine> builder)
        {
            builder.ToTable("Machine");

            builder.HasKey(machine => machine.Id);
            builder.Property(machine => machine.MachineNumber).IsRequired();
            builder.Property(machine => machine.Name).IsRequired().HasMaxLength(100);
            builder.Property(machine => machine.isActive).IsRequired().HasDefaultValue(true);

            builder.HasIndex(machine => machine.MachineNumber).IsUnique();
        }
    }
}