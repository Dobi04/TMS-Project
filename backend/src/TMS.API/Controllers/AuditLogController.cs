using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TMS.Application.DTOs.AuditLogDTOs;
using TMS.Application.Interfaces.AuditLogs;

namespace TMS.API.Controllers
{
    [ApiController]
    [Authorize]
    [EnableRateLimiting("api")]
    [Route("api/[controller]")]
    public class AuditLogController : ControllerBase
    {
        private readonly IAuditLogServices _auditLogServices;

        public AuditLogController(IAuditLogServices auditLogServices)
        {
            _auditLogServices = auditLogServices;
        }

        [HttpGet]
        [Authorize(Roles = "QualitySupervisor")]
        public async Task<IActionResult> GetAll([FromQuery] AuditLogFilterDTO filter)
        {
            var result = await _auditLogServices.GetAllAsync(filter);
            return Ok(result);
        }

        [HttpGet("entity/{entityName}/{entityId}")]
        [Authorize(Roles = "QualitySupervisor")]
        public async Task<IActionResult> GetByEntity(string entityName, string entityId)
        {
            var result = await _auditLogServices.GetByEntityAsync(entityName, entityId);
            return Ok(result);
        }
    }
}