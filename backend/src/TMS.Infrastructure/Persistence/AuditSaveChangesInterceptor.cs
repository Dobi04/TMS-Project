using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using TMS.Application.Interfaces;
using TMS.Domain.Entities;
using TMS.Domain.Enums;

namespace TMS.Infrastructure.Persistence
{
    public class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private static readonly HashSet<string> AuditedEntityNames = new(StringComparer.Ordinal)
        {
            nameof(Tyre),
            nameof(Sales),
            nameof(User),
            nameof(Machine)
        };

        private readonly ICurrentUserService _currentUserService;

        public AuditSaveChangesInterceptor(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            if (eventData.Context is AppDbContext dbContext)
            {
                var auditEntries = dbContext.ChangeTracker.Entries()
                    .Where(entry => entry.Entity is not AuditLog &&
                        AuditedEntityNames.Contains(entry.Metadata.ClrType.Name) &&
                        entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
                    .Select(CreateAuditLog)
                    .ToList();

                if (auditEntries.Count > 0)
                    await dbContext.AuditLogs.AddRangeAsync(auditEntries, cancellationToken);
            }

            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private AuditLog CreateAuditLog(EntityEntry entry)
        {
            var action = entry.State switch
            {
                EntityState.Added => AuditAction.Create,
                EntityState.Modified => AuditAction.Update,
                EntityState.Deleted => AuditAction.Delete,
                _ => throw new InvalidOperationException("Unsupported audit entry state.")
            };

            var key = entry.Properties.FirstOrDefault(property => property.Metadata.IsPrimaryKey());
            var entityId = key?.CurrentValue?.ToString() ?? string.Empty;

            return new AuditLog
            {
                EntityName = entry.Metadata.ClrType.Name,
                EntityId = entityId,
                Action = action,
                UserId = _currentUserService.UserId,
                Username = _currentUserService.Username ?? string.Empty,
                IpAddress = _currentUserService.IpAddress,
                Timestamp = DateTime.UtcNow,
                OldValues = SerializeValues(entry, useOriginalValues: true),
                NewValues = SerializeValues(entry, useOriginalValues: false)
            };
        }

        private static string? SerializeValues(EntityEntry entry, bool useOriginalValues)
        {
            var values = new Dictionary<string, object?>();

            foreach (var property in entry.Properties)
            {
                if (entry.State == EntityState.Modified && !property.IsModified)
                    continue;

                var value = useOriginalValues ? property.OriginalValue : property.CurrentValue;
                values[property.Metadata.Name] = property.Metadata.Name.Equals("PasswordHash", StringComparison.OrdinalIgnoreCase)
                    ? "***"
                    : value;
            }

            return values.Count == 0 ? null : JsonSerializer.Serialize(values);
        }
    }
}