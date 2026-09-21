namespace TMS.Application.DTOs.SalesDTOs
{
    public class SaleFilterDTO
    {
        public string? TyreCode { get; set; }
        public string? DestinationMarket { get; set; }
        public string? PurchasingCompany { get; set; }
        public int? RegisteredById { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = PaginationConstants.DefaultPageSize;
    }
}