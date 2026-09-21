using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;
using TMS.Domain.Enums;

namespace TMS.Domain.Entities
{
    public class Tyre
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public int QuantityProduced { get; set; }
        public int OperatorId { get; set; }
        public DateTime ProductionDate { get; set; } = DateTime.UtcNow;
        public Shift ProductionShift { get; set; } = Shift.NotAdded;
        public int MachineNumber { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
