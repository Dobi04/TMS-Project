namespace TMS.Application.DTOs.ReportDTOs
{
    public class StockBalanceDTO
    {
        public string TyreCode { get; set; } = string.Empty;
        public int TotalProduced { get; set; }
        public int TotalSold { get; set; }
        public int StockBalance { get; set; }
    }
}