using TMS.Application.DTOs.ReportDTOs;

namespace TMS.Application.Interfaces.Reports
{
    public interface IReportsServices
    {
        Task<List<ProductionByDayDTO>> GetProductionByDayAsync();
        Task<List<ProductionByShiftDTO>> GetProductionByShiftAsync();
        Task<List<ProductionByMachineDTO>> GetProductionByMachineAsync();
        Task<List<ProductionByOperatorDTO>> GetProductionByOperatorAsync();
        Task<List<StockBalanceDTO>> GetStockBalanceAsync(DateTime asOfDate);
    }
}