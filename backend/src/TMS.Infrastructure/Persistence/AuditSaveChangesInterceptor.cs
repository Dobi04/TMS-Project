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

        // Popunjava se u SavingChangesAsync, čita se u SavedChangesAsync (posle upisa u bazu).
        private List<PendingAuditEntry>? _pendingEntries;

        public AuditSaveChangesInterceptor(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            if (eventData.Context is AppDbContext dbContext)
            {
                _pendingEntries = dbContext.ChangeTracker.Entries()
                    .Where(entry => entry.Entity is not AuditLog &&
                        AuditedEntityNames.Contains(entry.Metadata.ClrType.Name) &&
                        entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
                    .Select(CreatePendingEntry)
                    .ToList();
            }

            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        public override async ValueTask<int> SavedChangesAsync(
            SaveChangesCompletedEventData eventData,
            int result,
            CancellationToken cancellationToken = default)
        {
            if (_pendingEntries is { Count: > 0 } pending && eventData.Context is AppDbContext dbContext)
            {
                _pendingEntries = null;

                var auditLogs = pending.Select(pendingEntry => new AuditLog
                {
                    EntityName = pendingEntry.EntityName,
                    EntityId = pendingEntry.EntityId ?? GetEntityId(pendingEntry.Entry),
                    Action = pendingEntry.Action,
                    UserId = _currentUserService.UserId,
                    Username = _currentUserService.Username ?? string.Empty,
                    IpAddress = _currentUserService.IpAddress,
                    Timestamp = DateTime.UtcNow,
                    OldValues = pendingEntry.OldValues,
                    NewValues = pendingEntry.NewValues
                }).ToList();

                await dbContext.AuditLogs.AddRangeAsync(auditLogs, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            return await base.SavedChangesAsync(eventData, result, cancellationToken);
        }

        private static PendingAuditEntry CreatePendingEntry(EntityEntry entry)
        {
            var action = entry.State switch
            {
                EntityState.Added => AuditAction.Create,
                EntityState.Modified => AuditAction.Update,
                EntityState.Deleted => AuditAction.Delete,
                _ => throw new InvalidOperationException("Unsupported audit entry state.")
            };

            var entityId = entry.State == EntityState.Added ? null : GetEntityId(entry);

            return new PendingAuditEntry(
                Entry: entry,
                EntityName: entry.Metadata.ClrType.Name,
                Action: action,
                EntityId: entityId,
                OldValues: SerializeValues(entry, useOriginalValues: true),
                NewValues: SerializeValues(entry, useOriginalValues: false));
        }

        private static string GetEntityId(EntityEntry entry)
        {
            var key = entry.Properties.FirstOrDefault(property => property.Metadata.IsPrimaryKey());
            return key?.CurrentValue?.ToString() ?? string.Empty;
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

        private sealed record PendingAuditEntry(
            EntityEntry Entry,
            string EntityName,
            AuditAction Action,
            string? EntityId,
            string? OldValues,
            string? NewValues);
    }
}