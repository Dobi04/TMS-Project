using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Application.DTOs.MachineDTOs;
using TMS.Application.Interfaces.Repositories;

namespace TMS.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "ProductionOperator,QualitySupervisor")]
    [Route("api/[controller]")]
    public class MachineController : ControllerBase
    {
        private readonly IMachineRepository _machineRepository;

        public MachineController(IMachineRepository machineRepository)
        {
            _machineRepository = machineRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetActiveMachines()
        {
            var machines = await _machineRepository.GetActiveAsync();
            return Ok(machines.Select(machine => new MachineOptionDTO
            {
                MachineNumber = machine.MachineNumber,
                Name = machine.Name
            }));
        }
    }
}