using System;
using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.SalesDTOs
{
    public class CreateSaleDTO
    {
        [Required]
        public int TyreId { get; set; }

        [Required, Range(1, int.MaxValue)]
        public int QuantitySold { get; set; }

        [Required, StringLength(20)]
        public string UnitOfMeasure { get; set; } = string.Empty;

        [Required, Range(0.01, double.MaxValue)]
        public decimal SalePriceByUnit { get; set; }

        public DateTime? SaleDate { get; set; }

        [Required, StringLength(100)]
        public string DestinationMarket { get; set; } = string.Empty;

        [Required, StringLength(150)]
        public string PurchasingCompany { get; set; } = string.Empty;
    }
}