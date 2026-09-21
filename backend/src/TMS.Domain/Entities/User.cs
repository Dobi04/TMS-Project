using TMS.Domain.Enums;

namespace TMS.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public Roles Role { get; set; } = Roles.Guest;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsEmailVerified { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }
}
