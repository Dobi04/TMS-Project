using System;
using System.Collections.Generic;
using System.Text;

namespace TMS.Domain.Entities
{
    public class Sales
    {
        public int Id { get; set; }
        public int TyreId { get; set; }
        public int RegisteredById { get; set; }
        public int QuantitySold { get; set; }
        public string UnitOfMeasure { get; set; } = string.Empty;
        public decimal SalePriceByUnit { get; set; }
        public DateTime SaleDate { get; set; } = DateTime.UtcNow;
        //Reference production order id i dont know what this is
        public string PurchasingCompany { get; set; } = string.Empty;
        public string DestinationMarket { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
