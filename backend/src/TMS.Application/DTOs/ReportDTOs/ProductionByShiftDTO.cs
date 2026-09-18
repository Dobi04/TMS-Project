namespace TMS.Application.DTOs.ReportDTOs
{
    public class ProductionByShiftDTO
    {
        public string Shift { get; set; } = string.Empty;
        public int TotalQuantityProduced { get; set; }
    }
}