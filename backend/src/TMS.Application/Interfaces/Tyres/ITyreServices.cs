using System;
using System.Collections.Generic;
using System.Text;
using TMS.Application.DTOs.Common;
using TMS.Application.DTOs.TyreDTOs;

namespace TMS.Application.Interfaces.Tyres
{
    public interface ITyreServices
    {
        #region ProductionOperator Operations
        Task<PagedResponseDTO<TyreResponseDTO>> GetMyTyresAsync(int operatorId, TyreFilterDTO filter);
        Task<TyreResponseDTO> CreateTyreAsync(int operatorId, CreateTyreDTO dto);
        #endregion

        #region QualitySupervisor Operations
        Task<PagedResponseDTO<TyreResponseDTO>> GetAllTyresAsync(TyreFilterDTO filter);
        Task<TyreResponseDTO> UpdateTyreAsync(int id, UpdateTyreDTO dto);
        Task DeleteTyreAsync(int id);
        #endregion
    }
}
