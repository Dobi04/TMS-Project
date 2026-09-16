using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.AuthDTOs
{
    public class RegistrationDTO
    {
        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;
        [Required, StringLength(100)]
        public string Surname { get; set; } = string.Empty;
        [Required, StringLength(50, MinimumLength = 3)]
        public string Username { get; set; } = string.Empty;
        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = string.Empty;
        [Required, MinLength(8)]
        public string Password { get; set; } = string.Empty;
    }
}
