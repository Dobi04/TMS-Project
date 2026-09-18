using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TMS.Application.Interfaces.Reports;

namespace TMS.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "BusinessUnitLeader")]
    [EnableRateLimiting("api")]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportsServices _reportsServices;

        public ReportsController(IReportsServices reportsServices)
        {
            _reportsServices = reportsServices;
        }

        [HttpGet("production-by-day")]
        public async Task<IActionResult> GetProductionByDay()
        {
            var result = await _reportsServices.GetProductionByDayAsync();
            return Ok(result);
        }

        [HttpGet("production-by-shift")]
        public async Task<IActionResult> GetProductionByShift()
        {
            var result = await _reportsServices.GetProductionByShiftAsync();
            return Ok(result);
        }

        [HttpGet("production-by-machine")]
        public async Task<IActionResult> GetProductionByMachine()
        {
            var result = await _reportsServices.GetProductionByMachineAsync();
            return Ok(result);
        }

        [HttpGet("production-by-operator")]
        public async Task<IActionResult> GetProductionByOperator()
        {
            var result = await _reportsServices.GetProductionByOperatorAsync();
            return Ok(result);
        }

        [HttpGet("stock-balance")]
        public async Task<IActionResult> GetStockBalance([FromQuery] DateTime? date)
        {
            var result = await _reportsServices.GetStockBalanceAsync(date?.Date ?? DateTime.UtcNow.Date);
            return Ok(result);
        }
    }
}