using System;
using System.Collections.Generic;
using System.Text;
using TMS.Application.DTOs.ReportDTOs;
using TMS.Domain.Entities;

namespace TMS.Application.Interfaces.Repositories
{
    public interface ITyreRepository
    {
        #region Query Methods
        Task<Tyre?> FindByIdAsync(int id);
        Task<Tyre?> FindByCodeAsync(string code);
        Task<List<Tyre>> FindByOperatorIdAsync(int operatorId);
        Task<List<Tyre>> GetAllAsync();
        #endregion

        #region Reporting Methods
        Task<List<ProductionByDayDTO>> GetProductionByDayAsync();
        Task<List<ProductionByShiftDTO>> GetProductionByShiftAsync();
        Task<List<ProductionByMachineDTO>> GetProductionByMachineAsync();
        Task<List<ProductionByOperatorDTO>> GetProductionByOperatorAsync();
        Task<Dictionary<string, int>> GetProducedByCodeAsync(DateTime asOfDate);
        #endregion

        #region Command Methods
        Task AddAsync(Tyre tyre);
        Task SaveChangesAsync();
        #endregion
    }
}
