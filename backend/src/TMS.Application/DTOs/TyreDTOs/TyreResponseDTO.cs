using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using TMS.Domain.Enums;

namespace TMS.Application.DTOs.TyreDTOs
{
    public class TyreResponseDTO
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public int QuantityProduced { get; set; }
        public int OperatorId { get; set; }
        public DateTime ProductionDate { get; set; }
        public string ProductionShift { get; set; } = string.Empty;
        public int MachineNumber { get; set; }
        public bool isActive { get; set; }
    }
}
