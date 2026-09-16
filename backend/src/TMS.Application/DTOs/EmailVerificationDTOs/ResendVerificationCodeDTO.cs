using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.EmailVerificationDTOs
{
    public class ResendVerificationCodeDTO
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
