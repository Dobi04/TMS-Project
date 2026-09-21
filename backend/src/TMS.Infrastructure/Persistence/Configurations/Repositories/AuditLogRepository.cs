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

        public async Task<(List<AuditLog> Items, int TotalCount)> GetPagedAsync(
            string? entityName = null,
            int? userId = null,
            AuditAction? action = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            int page = 1,
            int pageSize = 10)
        {
            var query = BuildQuery(entityName, null, userId, action, dateFrom, dateTo);
            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(auditLog => auditLog.Timestamp)
                .ThenByDescending(auditLog => auditLog.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<List<AuditLog>> GetAllAsync(
            string? entityName = null,
            string? entityId = null,
            int? userId = null,
            AuditAction? action = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null)
        {
            var query = BuildQuery(entityName, entityId, userId, action, dateFrom, dateTo);

            return await query
                .OrderByDescending(auditLog => auditLog.Timestamp)
                .ThenByDescending(auditLog => auditLog.Id)
                .ToListAsync();
        }

        private IQueryable<AuditLog> BuildQuery(
            string? entityName,
            string? entityId,
            int? userId,
            AuditAction? action,
            DateTime? dateFrom,
            DateTime? dateTo)
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

            return query;
        }

        public Task AddAsync(AuditLog auditLog) => _appDbContext.AuditLogs.AddAsync(auditLog).AsTask();

        public async Task SaveChangesAsync() => await _appDbContext.SaveChangesAsync();
    }
}