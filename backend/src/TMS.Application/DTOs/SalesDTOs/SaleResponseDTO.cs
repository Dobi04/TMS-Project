using System;

namespace TMS.Application.DTOs.SalesDTOs
{
    public class SaleResponseDTO
    {
        public int Id { get; set; }
        public int TyreId { get; set; }
        public string TyreCode { get; set; } = string.Empty;
        public int QuantitySold { get; set; }
        public string UnitOfMeasure { get; set; } = string.Empty;
        public decimal SalePriceByUnit { get; set; }
        public DateTime SaleDate { get; set; }
        public string DestinationMarket { get; set; } = string.Empty;
        public string PurchasingCompany { get; set; } = string.Empty;
        public int RegisteredById { get; set; }
        public bool IsActive { get; set; }
    }
}