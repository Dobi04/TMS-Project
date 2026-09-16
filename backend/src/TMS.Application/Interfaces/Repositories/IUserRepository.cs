using TMS.Domain.Entities;

namespace TMS.Application.Interfaces.Repositories;

public interface IUserRepository
{
    #region Query Methods
    Task<User?> FindByUsernameAsync(string username);
    Task<User?> FindByEmailAsync(string email);
    Task<PendingUserRegistration?> FindPendingByUsernameAsync(string username);
    Task<PendingUserRegistration?> FindPendingByEmailAsync(string email);
    #endregion

    #region Command Methods
    Task Add(User user);
    Task AddPendingAsync(PendingUserRegistration registration);
    Task RemovePendingAsync(PendingUserRegistration registration);
    Task SaveChangesAsync();
    #endregion
}
