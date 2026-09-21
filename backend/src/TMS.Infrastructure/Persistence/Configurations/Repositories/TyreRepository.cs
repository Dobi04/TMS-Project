using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TMS.Application.DTOs.ReportDTOs;
using TMS.Application.Interfaces.Repositories;
using TMS.Domain.Entities;

namespace TMS.Infrastructure.Persistence.Configurations.Repositories
{
    public class TyreRepository : ITyreRepository
    {
        #region Constants and Constructor
        private readonly AppDbContext _appDbContext;

        public TyreRepository(AppDbContext appbContext)
        {
            _appDbContext = appbContext;
        }
        #endregion

        #region Query Methods
        public async Task<Tyre?> FindByCodeAsync(string code) =>
            await _appDbContext.Tyres.FirstOrDefaultAsync(t => t.Code == code);

        public async Task<Tyre?> FindByIdAsync(int id) =>
            await _appDbContext.Tyres.FirstOrDefaultAsync(t => t.Id == id && t.IsActive);

        public async Task<List<Tyre>> FindByOperatorIdAsync(int operatorId) =>
            await _appDbContext.Tyres
                .Where(t => t.OperatorId == operatorId && t.IsActive)
                .OrderByDescending(t => t.ProductionDate)
                .ToListAsync();

        public async Task<List<Tyre>> GetAllAsync() =>
            await _appDbContext.Tyres
                .OrderByDescending(t => t.ProductionDate)
                .ToListAsync();
        #endregion

        #region Reporting Methods
        public async Task<List<ProductionByDayDTO>> GetProductionByDayAsync() =>
            await _appDbContext.Tyres
                .Where(t => t.IsActive)
                .GroupBy(t => t.ProductionDate.Date)
                .OrderBy(g => g.Key)
                .Select(g => new ProductionByDayDTO
                {
                    Date = g.Key,
                    TotalQuantityProduced = g.Sum(t => t.QuantityProduced)
                })
                .ToListAsync();

        public async Task<List<ProductionByShiftDTO>> GetProductionByShiftAsync() =>
            await _appDbContext.Tyres
                .Where(t => t.IsActive)
                .GroupBy(t => t.ProductionShift)
                .Select(g => new ProductionByShiftDTO
                {
                    Shift = g.Key.ToString(),
                    TotalQuantityProduced = g.Sum(t => t.QuantityProduced)
                })
                .ToListAsync();

        public async Task<List<ProductionByMachineDTO>> GetProductionByMachineAsync() =>
            await _appDbContext.Tyres
                .Where(t => t.IsActive)
                .GroupBy(t => t.MachineNumber)
                .Select(g => new ProductionByMachineDTO
                {
                    MachineNumber = g.Key,
                    TotalQuantityProduced = g.Sum(t => t.QuantityProduced)
                })
                .ToListAsync();

        public async Task<List<ProductionByOperatorDTO>> GetProductionByOperatorAsync() =>
            await _appDbContext.Tyres
                .Where(t => t.IsActive)
                .GroupBy(t => t.OperatorId)
                .Select(g => new ProductionByOperatorDTO
                {
                    OperatorId = g.Key,
                    TotalQuantityProduced = g.Sum(t => t.QuantityProduced)
                })
                .ToListAsync();

        public async Task<Dictionary<string, int>> GetProducedByCodeAsync(DateTime asOfDate) =>
            await _appDbContext.Tyres
                .Where(t => t.IsActive && t.ProductionDate.Date <= asOfDate.Date)
                .GroupBy(t => t.Code)
                .Select(g => new { Code = g.Key, Total = g.Sum(t => t.QuantityProduced) })
                .ToDictionaryAsync(x => x.Code, x => x.Total);
        #endregion

        #region Command Methods
        public Task AddAsync(Tyre tyre) => _appDbContext.Tyres.AddAsync(tyre).AsTask();

        public async Task SaveChangesAsync() => await _appDbContext.SaveChangesAsync();
        #endregion
    }
}
