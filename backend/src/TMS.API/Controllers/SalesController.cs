using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using TMS.Application.DTOs.SalesDTOs;
using TMS.Application.Interfaces.Sales;

namespace TMS.API.Controllers
{
    [ApiController]
    [Authorize]
    [EnableRateLimiting("api")]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        #region Constants and Constructors
        private readonly ISalesServices _salesServices;

        public SalesController(ISalesServices salesServices)
        {
            _salesServices = salesServices;
        }
        #endregion

        #region QualitySupervisor Endpoint
        [HttpGet("mine")]
        [Authorize(Roles = "QualitySupervisor")]
        public async Task<IActionResult> GetMySales([FromQuery] SaleFilterDTO filter)
        {
            try
            {
                var sales = await _salesServices.GetMySalesAsync(GetCurrentUserId(), filter);
                return Ok(sales);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "QualitySupervisor")]
        public async Task<IActionResult> CreateSale(CreateSaleDTO dto)
        {
            try
            {
                var result = await _salesServices.CreateSaleAsync(GetCurrentUserId(), dto);
                return Created($"/api/sales/{result.Id}", result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        #endregion

        #region BusinessUnitLeader Endpoint
        [HttpGet]
        [Authorize(Roles = "BusinessUnitLeader")]
        public async Task<IActionResult> GetAllSales([FromQuery] SaleFilterDTO filter)
        {
            try
            {
                var sales = await _salesServices.GetAllSalesAsync(filter);
                return Ok(sales);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
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