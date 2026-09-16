using TMS.Application.Interfaces.Repositories;
using TMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace TMS.Infrastructure.Persistence.Configurations.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _appDbContext;

        public UserRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        public Task Add(User user) => _appDbContext.Users.AddAsync(user).AsTask();

        public async Task<User?> FindByEmailAsync(string email) => await _appDbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User?> FindByUsernameAsync(string username) => await _appDbContext.Users.FirstOrDefaultAsync(u => u.Username == username);

        public async Task<PendingUserRegistration?> FindPendingByEmailAsync(string email) => await _appDbContext.PendingUserRegistrations.FirstOrDefaultAsync(r => r.Email == email);

        public async Task<PendingUserRegistration?> FindPendingByUsernameAsync(string username) => await _appDbContext.PendingUserRegistrations.FirstOrDefaultAsync(r => r.Username == username);

        public Task AddPendingAsync(PendingUserRegistration registration) => _appDbContext.PendingUserRegistrations.AddAsync(registration).AsTask();

        public Task RemovePendingAsync(PendingUserRegistration registration)
        {
            _appDbContext.PendingUserRegistrations.Remove(registration);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync() => await _appDbContext.SaveChangesAsync();
    }
}
