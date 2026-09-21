using Microsoft.EntityFrameworkCore;
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

        public async Task<List<SaleEntity>> FindByRegisteredByIdAsync(int registeredById) =>
            await _appDbContext.Sales
                .Where(s => s.RegisteredById == registeredById && s.IsActive)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();

        public async Task<List<SaleEntity>> GetAllAsync() =>
            await _appDbContext.Sales
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();
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