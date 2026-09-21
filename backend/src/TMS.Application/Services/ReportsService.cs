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

        public Task<List<ProductionByDayDTO>> GetProductionByDayAsync() =>
            _tyreRepository.GetProductionByDayAsync();

        public Task<List<ProductionByShiftDTO>> GetProductionByShiftAsync() =>
            _tyreRepository.GetProductionByShiftAsync();

        public Task<List<ProductionByMachineDTO>> GetProductionByMachineAsync() =>
            _tyreRepository.GetProductionByMachineAsync();

        public Task<List<ProductionByOperatorDTO>> GetProductionByOperatorAsync() =>
            _tyreRepository.GetProductionByOperatorAsync();

        public async Task<List<StockBalanceDTO>> GetStockBalanceAsync(DateTime asOfDate)
        {
            var producedByCode = await _tyreRepository.GetProducedByCodeAsync(asOfDate);
            var soldByCode  = await _salesRepository.GetSoldByCodeAsync(asOfDate);

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