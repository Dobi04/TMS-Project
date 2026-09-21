using System.Collections.Generic;
using TMS.Domain.Entities;
using SaleEntity = TMS.Domain.Entities.Sales;

namespace TMS.Application.Interfaces.Repositories
{
    public interface ISalesRepository
    {
        #region Query Methods
        Task<SaleEntity?> FindByIdAsync(int id);
        Task<List<SaleEntity>> FindByRegisteredByIdAsync(int registeredById);
        Task<List<SaleEntity>> GetAllAsync();
        Task<int> GetTotalSoldForTyreAsync(int tyreId);
        #endregion

        #region Reporting Methods
        Task<Dictionary<string, int>> GetSoldByCodeAsync(DateTime asOfDate);
        #endregion

        #region Command Methods
        Task AddAsync(SaleEntity sale);
        Task SaveChangesAsync();
        #endregion
    }
}