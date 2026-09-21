using System.Collections.Generic;
using TMS.Application.DTOs.Common;
using TMS.Application.DTOs.SalesDTOs;

namespace TMS.Application.Interfaces.Sales
{
    public interface ISalesServices
    {
        #region QualitySupervisor Operations
        Task<PagedResponseDTO<SaleResponseDTO>> GetMySalesAsync(int registeredById, SaleFilterDTO filter);
        Task<SaleResponseDTO> CreateSaleAsync(int registeredById, CreateSaleDTO dto);
        #endregion

        #region BusinessUnitLeader Operations
        Task<PagedResponseDTO<SaleResponseDTO>> GetAllSalesAsync(SaleFilterDTO filter);
        #endregion
    }
}