using System;
using System.Collections.Generic;
using System.Text;
using TMS.Application.DTOs.TyreDTOs;

namespace TMS.Application.Interfaces.Tyres
{
    public interface ITyreServices
    {
        #region ProductionOperator Operations
        Task<List<TyreResponseDTO>> GetMyTyresAsync(int operatorId);
        Task<TyreResponseDTO> CreateTyreAsync(int operatorId, CreateTyreDTO dto);
        #endregion

        #region QualitySupervisor Operations
        Task<List<TyreResponseDTO>> GetAllTyresAsync();
        Task<TyreResponseDTO> UpdateTyreAsync(int id, UpdateTyreDTO dto);
        Task DeleteTyreAsync(int id);
        #endregion
    }
}
