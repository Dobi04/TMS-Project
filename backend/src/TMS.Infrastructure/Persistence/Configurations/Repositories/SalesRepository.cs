using Microsoft.EntityFrameworkCore;
using TMS.Application;
using TMS.Application.DTOs.SalesDTOs;
using TMS.Application.Interfaces.Repositories;
using TMS.Domain.Entities;
using SaleEntity = TMS.Domain.Entities.Sales;

namespace TMS.Infrastructure.Persistence.Configurations.Repositories
{
    public class SalesRepository : ISalesRepository
    {
        #region Constants and Constructor
        private readonly AppDbContext _appDbContext;

        public SalesRepository(AppDbContext appbContext)
        {
            _appDbContext = appbContext;
        }
        #endregion

        #region Query Methods
        public async Task<SaleEntity?> FindByIdAsync(int id) =>
            await _appDbContext.Sales.FirstOrDefaultAsync(s => s.Id == id && s.IsActive);

        public async Task<(List<SaleResponseDTO> Items, int TotalCount)> GetPagedAsync(
            SaleFilterDTO filter,
            int? registeredByScope = null,
            bool activeOnly = false)
        {
            var query = _appDbContext.Sales
                .Join(_appDbContext.Tyres,
                    sale => sale.TyreId,
                    tyre => tyre.Id,
                    (sale, tyre) => new { sale, tyre });

            if (registeredByScope.HasValue)
                query = query.Where(item => item.sale.RegisteredById == registeredByScope.Value);

            if (activeOnly)
                query = query.Where(item => item.sale.IsActive);

            if (!string.IsNullOrWhiteSpace(filter.TyreCode))
                query = query.Where(item => item.tyre.Code.Contains(filter.TyreCode));

            if (!string.IsNullOrWhiteSpace(filter.DestinationMarket))
                query = query.Where(item => item.sale.DestinationMarket.Contains(filter.DestinationMarket));

            if (!string.IsNullOrWhiteSpace(filter.PurchasingCompany))
                query = query.Where(item => item.sale.PurchasingCompany.Contains(filter.PurchasingCompany));

            if (filter.RegisteredById.HasValue && !registeredByScope.HasValue)
                query = query.Where(item => item.sale.RegisteredById == filter.RegisteredById.Value);

            if (filter.DateFrom.HasValue)
                query = query.Where(item => item.sale.SaleDate >= filter.DateFrom.Value.Date);

            if (filter.DateTo.HasValue)
                query = query.Where(item => item.sale.SaleDate < filter.DateTo.Value.Date.AddDays(1));

            var totalCount = await query.CountAsync();
            var page = Math.Max(filter.Page, 1);
            var pageSize = filter.PageSize <= 0
                ? PaginationConstants.DefaultPageSize
                : Math.Clamp(filter.PageSize, 1, PaginationConstants.MaxPageSize);
            var items = await query
                .OrderByDescending(item => item.sale.SaleDate)
                .ThenByDescending(item => item.sale.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(item => new SaleResponseDTO
                {
                    Id = item.sale.Id,
                    TyreId = item.sale.TyreId,
                    TyreCode = item.tyre.Code,
                    QuantitySold = item.sale.QuantitySold,
                    UnitOfMeasure = item.sale.UnitOfMeasure,
                    SalePriceByUnit = item.sale.SalePriceByUnit,
                    SaleDate = item.sale.SaleDate,
                    DestinationMarket = item.sale.DestinationMarket,
                    PurchasingCompany = item.sale.PurchasingCompany,
                    RegisteredById = item.sale.RegisteredById,
                    IsActive = item.sale.IsActive
                })
                .ToListAsync();

            return (items, totalCount);
        }
        public async Task<int> GetTotalSoldForTyreAsync(int tyreId) =>
            await _appDbContext.Sales
                .Where(s => s.TyreId == tyreId && s.IsActive)
                .SumAsync(s => (int?)s.QuantitySold) ?? 0;
        #endregion

        #region Reporting Methods
        public async Task<Dictionary<string, int>> GetSoldByCodeAsync(DateTime asOfDate) =>
            await _appDbContext.Sales
                .Where(s => s.IsActive && s.SaleDate.Date <= asOfDate.Date)
                .Join(_appDbContext.Tyres,
                    sale => sale.TyreId,
                    tyre => tyre.Id,
                    (sale, tyre) => new { tyre.Code, sale.QuantitySold })
                .GroupBy(x => x.Code)
                .Select(g => new { Code = g.Key, Total = g.Sum(x => x.QuantitySold) })
                .ToDictionaryAsync(x => x.Code, x => x.Total);
        #endregion

        #region Command Methods
        public Task AddAsync(SaleEntity sale) => _appDbContext.Sales.AddAsync(sale).AsTask();

        public async Task SaveChangesAsync() => await _appDbContext.SaveChangesAsync();
        #endregion
    }
}