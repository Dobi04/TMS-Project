using Microsoft.EntityFrameworkCore;
using TMS.Application;
using System;
using System.Collections.Generic;
using System.Text;
using TMS.Application.DTOs.ReportDTOs;
using TMS.Application.DTOs.TyreDTOs;
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

        public async Task<(List<Tyre> Items, int TotalCount)> GetPagedAsync(
            TyreFilterDTO filter,
            int? operatorScope = null,
            bool activeOnly = false)
        {
            var query = _appDbContext.Tyres.AsQueryable();

            if (operatorScope.HasValue)
                query = query.Where(t => t.OperatorId == operatorScope.Value);

            if (activeOnly)
                query = query.Where(t => t.IsActive);
            else if (filter.IsActive.HasValue)
                query = query.Where(t => t.IsActive == filter.IsActive.Value);

            if (!string.IsNullOrWhiteSpace(filter.Code))
                query = query.Where(t => t.Code.Contains(filter.Code));

            if (filter.OperatorId.HasValue && !operatorScope.HasValue)
                query = query.Where(t => t.OperatorId == filter.OperatorId.Value);

            if (filter.Shift.HasValue)
                query = query.Where(t => t.ProductionShift == filter.Shift.Value);

            if (filter.MachineNumber.HasValue)
                query = query.Where(t => t.MachineNumber == filter.MachineNumber.Value);

            if (filter.DateFrom.HasValue)
                query = query.Where(t => t.ProductionDate >= filter.DateFrom.Value.Date);

            if (filter.DateTo.HasValue)
                query = query.Where(t => t.ProductionDate < filter.DateTo.Value.Date.AddDays(1));

            var totalCount = await query.CountAsync();
            var page = Math.Max(filter.Page, 1);
            var pageSize = filter.PageSize <= 0
                ? PaginationConstants.DefaultPageSize
                : Math.Clamp(filter.PageSize, 1, PaginationConstants.MaxPageSize);
            var items = await query
                .OrderByDescending(t => t.ProductionDate)
                .ThenByDescending(t => t.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
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
