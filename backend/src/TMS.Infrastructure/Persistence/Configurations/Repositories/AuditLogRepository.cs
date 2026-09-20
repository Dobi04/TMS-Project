using Microsoft.EntityFrameworkCore;
using TMS.Application.Interfaces.Repositories;
using TMS.Domain.Entities;
using TMS.Domain.Enums;

namespace TMS.Infrastructure.Persistence.Configurations.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly AppDbContext _appDbContext;

        public AuditLogRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public async Task<AuditLog?> FindByIdAsync(int id) =>
            await _appDbContext.AuditLogs.FirstOrDefaultAsync(auditLog => auditLog.Id == id);

        public async Task<List<AuditLog>> GetAllAsync(
            string? entityName = null,
            string? entityId = null,
            int? userId = null,
            AuditAction? action = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null)
        {
            var query = _appDbContext.AuditLogs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(entityName))
                query = query.Where(auditLog => auditLog.EntityName == entityName);

            if (!string.IsNullOrWhiteSpace(entityId))
                query = query.Where(auditLog => auditLog.EntityId == entityId);

            if (userId.HasValue)
                query = query.Where(auditLog => auditLog.UserId == userId.Value);

            if (action.HasValue)
                query = query.Where(auditLog => auditLog.Action == action.Value);

            if (dateFrom.HasValue)
                query = query.Where(auditLog => auditLog.Timestamp >= dateFrom.Value);

            if (dateTo.HasValue)
                query = query.Where(auditLog => auditLog.Timestamp <= dateTo.Value);

            return await query
                .OrderByDescending(auditLog => auditLog.Timestamp)
                .ToListAsync();
        }

        public Task AddAsync(AuditLog auditLog) => _appDbContext.AuditLogs.AddAsync(auditLog).AsTask();

        public async Task SaveChangesAsync() => await _appDbContext.SaveChangesAsync();
    }
}