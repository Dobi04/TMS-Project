using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TMS.Domain.Entities;

namespace TMS.Infrastructure.Persistence.Configurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLog");

            builder.HasKey(auditLog => auditLog.Id);
            builder.Property(auditLog => auditLog.EntityName).IsRequired().HasMaxLength(100);
            builder.Property(auditLog => auditLog.EntityId).IsRequired().HasMaxLength(100);
            builder.Property(auditLog => auditLog.Username).IsRequired().HasMaxLength(50);
            builder.Property(auditLog => auditLog.IpAddress).HasMaxLength(45);
            builder.Property(auditLog => auditLog.OldValues).HasColumnType("json");
            builder.Property(auditLog => auditLog.NewValues).HasColumnType("json");
            builder.Property(auditLog => auditLog.Timestamp).IsRequired();

            builder.HasIndex(auditLog => new { auditLog.EntityName, auditLog.EntityId });
            builder.HasIndex(auditLog => auditLog.Timestamp);
        }
    }
}