using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TMS.Application.Interfaces.Repositories;
using TMS.Domain.Entities;

namespace TMS.Infrastructure.Persistence.Configurations.Repositories
{
    public class TyreRepository : ITyreRepository
    {
        #region Constants and Constructor
        private readonly AppDbContext _appDbContext;

        public TyreRepository(AppDbContext appbContext)
        {
            _appDbContext = appbContext;
        }
        #endregion

        #region Query Methods
        public async Task<Tyre?> FindByCodeAsync(string code) =>
            await _appDbContext.Tyres.FirstOrDefaultAsync(t => t.Code == code);

        public async Task<Tyre?> FindByIdAsync(int id) =>
            await _appDbContext.Tyres.FirstOrDefaultAsync(t => t.Id == id && t.isActive);

        public async Task<List<Tyre>> FindByOperatorIdAsync(int operatorId) =>
            await _appDbContext.Tyres
                .Where(t => t.OperatorId == operatorId && t.isActive)
                .OrderByDescending(t => t.ProductionDate)
                .ToListAsync();

        public async Task<List<Tyre>> GetAllAsync() =>
            await _appDbContext.Tyres
                .OrderByDescending(t => t.ProductionDate)
                .ToListAsync();
        #endregion

        #region Command Methods
        public Task AddAsync(Tyre tyre) => _appDbContext.Tyres.AddAsync(tyre).AsTask();

        public async Task SaveChangesAsync() => await _appDbContext.SaveChangesAsync();
        #endregion
    }
}
