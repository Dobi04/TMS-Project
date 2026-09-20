using TMS.Application.DTOs.AuditLogDTOs;
using TMS.Application.Interfaces.AuditLogs;
using TMS.Application.Interfaces.Repositories;
using TMS.Domain.Entities;

namespace TMS.Application.Services
{
    public class AuditLogService : IAuditLogServices
    {
        private const int DefaultPageSize = 50;
        private const int MaxPageSize = 200;

        private readonly IAuditLogRepository _auditLogRepository;

        public AuditLogService(IAuditLogRepository auditLogRepository)
        {
            _auditLogRepository = auditLogRepository;
        }

        public async Task<AuditLogPagedResponseDTO> GetAllAsync(AuditLogFilterDTO filter)
        {
            var page = Math.Max(filter.Page, 1);
            var pageSize = Math.Clamp(filter.PageSize, 1, MaxPageSize);         
            if (filter.PageSize <= 0)
                pageSize = DefaultPageSize;

            var auditLogs = await _auditLogRepository.GetAllAsync(
                filter.EntityName,
                userId: filter.UserId,
                action: filter.Action,
                dateFrom: filter.DateFrom,
                dateTo: filter.DateTo);

            var totalCount = auditLogs.Count;
            var items = auditLogs
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(ToResponseDto)
                .ToList();

            return new AuditLogPagedResponseDTO
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<List<AuditLogResponseDTO>> GetByEntityAsync(string entityName, string entityId)
        {
            var auditLogs = await _auditLogRepository.GetAllAsync(entityName, entityId);
            return auditLogs.Select(ToResponseDto).ToList();
        }

        private static AuditLogResponseDTO ToResponseDto(AuditLog auditLog) => new()
        {
            Id = auditLog.Id,
            EntityName = auditLog.EntityName,
            EntityId = auditLog.EntityId,
            Action = auditLog.Action,
            UserId = auditLog.UserId,
            Username = auditLog.Username,
            Timestamp = auditLog.Timestamp,
            OldValues = auditLog.OldValues,
            NewValues = auditLog.NewValues,
            IpAddress = auditLog.IpAddress
        };
    }
}