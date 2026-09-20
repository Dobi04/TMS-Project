using TMS.Domain.Entities;
using TMS.Domain.Enums;

namespace TMS.Application.Interfaces.Repositories
{
    public interface IAuditLogRepository
    {
        Task<AuditLog?> FindByIdAsync(int id);
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