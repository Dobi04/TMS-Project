using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Text;
using TMS.Domain.Enums;

namespace TMS.Application.DTOs.TyreDTOs
{
    public class CreateTyreDTO
    {
        [Required, StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required, Range(1, int.MaxValue)]
        public int QuantityProduced { get; set; }

        [Required]
        public Shift ProductionShift { get; set; } = Shift.NotAdded;

        [Required, Range(1,int.MaxValue)]
        public int MachineNumber { get; set; }

        public DateTime? ProductionDate { get; set; }
    }
}
