using System.Collections.Generic;
using TMS.Application.DTOs.SalesDTOs;
using TMS.Application.DTOs.Common;
using TMS.Domain.Entities;
using SaleEntity = TMS.Domain.Entities.Sales;

namespace TMS.Application.Interfaces.Repositories
{
    public interface ISalesRepository
    {
        #region Query Methods
        Task<SaleEntity?> FindByIdAsync(int id);
        Task<(List<SaleResponseDTO> Items, int TotalCount)> GetPagedAsync(
            SaleFilterDTO filter,
            int? registeredByScope = null,
            bool activeOnly = false);
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