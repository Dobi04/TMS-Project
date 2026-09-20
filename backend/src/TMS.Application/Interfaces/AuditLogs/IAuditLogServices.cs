using TMS.Application.DTOs.AuditLogDTOs;

namespace TMS.Application.Interfaces.AuditLogs
{
    public interface IAuditLogServices
    {
        Task<AuditLogPagedResponseDTO> GetAllAsync(AuditLogFilterDTO filter);
        Task<List<AuditLogResponseDTO>> GetByEntityAsync(string entityName, string entityId);
    }
}