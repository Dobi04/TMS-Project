using TMS.Domain.Entities;
using TMS.Domain.Enums;

namespace TMS.Application.Interfaces.Repositories
{
    public interface IAuditLogRepository
    {
        Task<AuditLog?> FindByIdAsync(int id);
        Task<(List<AuditLog> Items, int TotalCount)> GetPagedAsync(
            string? entityName = null,
            int? userId = null,
            AuditAction? action = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            int page = 1,
            int pageSize = 10);
        Task<List<AuditLog>> GetAllAsync(
            string? entityName = null,
            string? entityId = null,
            int? userId = null,
            AuditAction? action = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null);
        Task AddAsync(AuditLog auditLog);
        Task SaveChangesAsync();
    }
}