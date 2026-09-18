using System.Collections.Generic;
using TMS.Application.DTOs.SalesDTOs;

namespace TMS.Application.Interfaces.Sales
{
    public interface ISalesServices
    {
        #region QualitySupervisor Operations
        Task<List<SaleResponseDTO>> GetMySalesAsync(int registeredById);
        Task<SaleResponseDTO> CreateSaleAsync(int registeredById, CreateSaleDTO dto);
        #endregion

        #region BusinessUnitLeader Operations
        Task<List<SaleResponseDTO>> GetAllSalesAsync();
        #endregion
    }
}