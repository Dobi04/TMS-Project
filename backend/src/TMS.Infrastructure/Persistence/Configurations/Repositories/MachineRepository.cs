using Microsoft.EntityFrameworkCore;
using TMS.Application.Interfaces.Repositories;
using TMS.Domain.Entities;

namespace TMS.Infrastructure.Persistence.Configurations.Repositories
{
    public class MachineRepository : IMachineRepository
    {
        private readonly AppDbContext _appDbContext;

        public MachineRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public async Task<List<Machine>> GetActiveAsync() =>
            await _appDbContext.Machines
                .Where(machine => machine.IsActive)
                .OrderBy(machine => machine.MachineNumber)
                .ToListAsync();

        public async Task<Machine?> FindByMachineNumberAsync(int machineNumber) =>
            await _appDbContext.Machines
                .FirstOrDefaultAsync(machine => machine.MachineNumber == machineNumber);
    }
}
