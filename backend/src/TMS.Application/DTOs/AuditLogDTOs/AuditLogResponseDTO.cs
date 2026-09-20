using TMS.Domain.Enums;

namespace TMS.Application.DTOs.AuditLogDTOs
{
    public class AuditLogResponseDTO
    {
        public int Id { get; set; }
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public AuditAction Action { get; set; }
        public int? UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? IpAddress { get; set; }
    }
}