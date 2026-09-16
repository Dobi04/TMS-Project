using System;
using System.Collections.Generic;
using System.Text;

namespace TMS.Domain.Entities
{
    public class Sales
    {
        public int Id { get; set; }
        public int TyreId { get; set; }
        public int QuantitySold { get; set; }
        public double SalePriceByUnit { get; set; }
        public DateTime SaleDate { get; set; } = DateTime.UtcNow;
        //Reference production order id i dont know what this is
        public string DestinationMarket { get; set; } = string.Empty;
    }
}
