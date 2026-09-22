using TMS.Domain.Entities;

namespace TMS.Application.Interfaces.Repositories
{
    public interface IMachineRepository
    {
        Task<List<Machine>> GetActiveAsync();
        Task<Machine?> FindByMachineNumberAsync(int machineNumber);
    }
}
