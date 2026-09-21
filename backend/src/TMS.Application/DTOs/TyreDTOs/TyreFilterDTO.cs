using TMS.Domain.Enums;

namespace TMS.Application.DTOs.TyreDTOs
{
    public class TyreFilterDTO
    {
        public string? Code { get; set; }
        public int? OperatorId { get; set; }
        public Shift? Shift { get; set; }
        public int? MachineNumber { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = PaginationConstants.DefaultPageSize;
    }
}