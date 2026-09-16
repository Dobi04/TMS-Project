using TMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace TMS.Infrastructure.Persistence.Configurations
{
    public class PendingUserRegistrationConfiguration : IEntityTypeConfiguration<PendingUserRegistration>
    {
        public void Configure(EntityTypeBuilder<PendingUserRegistration> builder)
        {
            builder.ToTable("PendingUserRegistration");

            builder.HasKey(registration => registration.Id);
            builder.Property(registration => registration.Name).IsRequired().HasMaxLength(100);
            builder.Property(registration => registration.Surname).IsRequired().HasMaxLength(100);
            builder.Property(registration => registration.Username).IsRequired().HasMaxLength(50);
            builder.Property(registration => registration.Email).IsRequired().HasMaxLength(100);
            builder.Property(registration => registration.PasswordHash).IsRequired().HasMaxLength(255);
            builder.Property(registration => registration.VerificationCode).IsRequired().HasMaxLength(10);
            builder.Property(registration => registration.VerificationCodeExpiry).IsRequired();

            builder.HasIndex(registration => registration.Username).IsUnique();
            builder.HasIndex(registration => registration.Email).IsUnique();
        }
    }
}