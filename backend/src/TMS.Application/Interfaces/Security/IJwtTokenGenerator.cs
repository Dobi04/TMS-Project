using TMS.Domain.Entities;

namespace TMS.Application.Interfaces.Security;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
