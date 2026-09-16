using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.AuthDTOs
{
    public class LogInDTO
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
