using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.EmailVerificationDTOs
{
    public class VerifyEmailDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, StringLength(6, MinimumLength = 6), RegularExpression("^[0-9]{6}$")]
        public string Code { get; set; } = string.Empty;
    }
}
