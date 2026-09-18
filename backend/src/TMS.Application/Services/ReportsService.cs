using TMS.Application.DTOs.ReportDTOs;
using TMS.Application.Interfaces.Reports;
using TMS.Application.Interfaces.Repositories;

namespace TMS.Application.Services
{
    public class ReportsService : IReportsServices
    {
        private readonly ITyreRepository _tyreRepository;
        private readonly ISalesRepository _salesRepository;

        public ReportsService(ITyreRepository tyreRepository, ISalesRepository salesRepository)
        {
            _tyreRepository = tyreRepository;
            _salesRepository = salesRepository;
        }

        public async Task<List<ProductionByDayDTO>> GetProductionByDayAsync()
        {
            var tyres = await _tyreRepository.GetAllAsync();

            return tyres
                .Where(tyre => tyre.isActive)
                .GroupBy(tyre => tyre.ProductionDate.Date)
                .OrderBy(group => group.Key)
                .Select(group => new ProductionByDayDTO
                {
                    Date = group.Key,
                    TotalQuantityProduced = group.Sum(tyre => tyre.QuantityProduced)
                })
                .ToList();
        }

        public async Task<List<ProductionByShiftDTO>> GetProductionByShiftAsync()
        {
            var tyres = await _tyreRepository.GetAllAsync();

            return tyres
                .GroupBy(tyre => tyre.ProductionShift.ToString())
                .Select(group => new ProductionByShiftDTO
                {
                    Shift = group.Key,
                    TotalQuantityProduced = group.Sum(tyre => tyre.QuantityProduced)
                })
                .ToList();
        }

        public async Task<List<ProductionByMachineDTO>> GetProductionByMachineAsync()
        {
            var tyres = await _tyreRepository.GetAllAsync();

            return tyres
                .GroupBy(tyre => tyre.MachineNumber)
                .Select(group => new ProductionByMachineDTO
                {
                    MachineNumber = group.Key,
                    TotalQuantityProduced = group.Sum(tyre => tyre.QuantityProduced)
                })
                .ToList();
        }

        public async Task<List<ProductionByOperatorDTO>> GetProductionByOperatorAsync()
        {
            var tyres = await _tyreRepository.GetAllAsync();

            return tyres
                .GroupBy(tyre => tyre.OperatorId)
                .Select(group => new ProductionByOperatorDTO
                {
                    OperatorId = group.Key,
                    TotalQuantityProduced = group.Sum(tyre => tyre.QuantityProduced)
                })
                .ToList();
        }

        public async Task<List<StockBalanceDTO>> GetStockBalanceAsync(DateTime asOfDate)
        {
            var tyres = await _tyreRepository.GetAllAsync();
            var sales = await _salesRepository.GetAllAsync();
            var activeTyres = tyres.Where(tyre => tyre.isActive).ToList();

            var producedByCode = activeTyres
                .Where(tyre => tyre.ProductionDate.Date <= asOfDate.Date)
                .GroupBy(tyre => tyre.Code)
                .ToDictionary(group => group.Key, group => group.Sum(tyre => tyre.QuantityProduced));

            var tyreCodesById = tyres.ToDictionary(tyre => tyre.Id, tyre => tyre.Code);
            var soldByCode = sales
                .Where(sale => sale.isActive && sale.SaleDate.Date <= asOfDate.Date)
                .Where(sale => tyreCodesById.ContainsKey(sale.TyreId))
                .GroupBy(sale => tyreCodesById[sale.TyreId])
                .ToDictionary(group => group.Key, group => group.Sum(sale => sale.QuantitySold));

            return producedByCode.Keys
                .Union(soldByCode.Keys)
                .OrderBy(code => code)
                .Select(code =>
                {
                    producedByCode.TryGetValue(code, out var totalProduced);
                    soldByCode.TryGetValue(code, out var totalSold);

                    return new StockBalanceDTO
                    {
                        TyreCode = code,
                        TotalProduced = totalProduced,
                        TotalSold = totalSold,
                        StockBalance = totalProduced - totalSold
                    };
                })
                .ToList();
        }
    }
}