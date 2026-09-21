using System;
using System.Collections.Generic;
using System.Text;

namespace TMS.Domain.Entities
{
    public class Machine
    {
        public int Id { get; set; }
        public int MachineNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
