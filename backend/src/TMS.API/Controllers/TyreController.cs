using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using System.Security.Claims;
using TMS.Application.DTOs.TyreDTOs;
using TMS.Application.Interfaces.Tyres;
using TMS.Domain.Enums;

namespace TMS.API.Controllers
{
    [ApiController]
    [Authorize]
    [EnableRateLimiting("api")]
    [Route("api/[controller]")]
    public class TyreController : ControllerBase
    {
        #region Constants and Constructors
        private readonly ITyreServices _tyreServices;

        public TyreController(ITyreServices tyreServices)
        {
            _tyreServices = tyreServices;
        }
        #endregion

        #region ProductionOperator Endpoint
        [HttpGet("mine")]
        [Authorize(Roles = nameof(Roles.ProductionOperator))]
        public async Task<IActionResult> GetMyTyres()
        {
            var operatorId = GetCurrentUserId();
            var tyres = await _tyreServices.GetMyTyresAsync(operatorId);
            return Ok(tyres);
        }

        [HttpPost]
        [Authorize(Roles = "ProductionOperator,QualitySupervisor")]
        public async Task<IActionResult> CreateTyre(CreateTyreDTO dto)
        {
            try
            {
                var operatorId = GetCurrentUserId();
                var result = await _tyreServices.CreateTyreAsync(operatorId, dto);
                return Created($"/api/tyre/{result.Id}", result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
            {
                return Conflict(new { message = "A tyre with this code already exists." });
            }
        }
        #endregion

        #region QualitySupervisor Endpoint
        [HttpGet]
        [Authorize(Roles = "QualitySupervisor,BusinessUnitLeader")]
        public async Task<IActionResult> GetAllTyres()
        {
            var tyres = await _tyreServices.GetAllTyresAsync();
            return Ok(tyres);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "QualitySupervisor")]
        public async Task<IActionResult> UpdateTyre(int id, UpdateTyreDTO dto)
        {
            try
            {
                var result = await _tyreServices.UpdateTyreAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
            {
                return Conflict(new { message = "A tyre with this code already exists." });
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "QualitySupervisor")]
        public async Task<IActionResult> DeleteTyre(int id)
        {
            try
            {
                await _tyreServices.DeleteTyreAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        #endregion

        #region Helpers
        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(idClaim!);
        }
        #endregion
    }
}
