using System;
using System.Collections.Generic;
using System.Text;
using TMS.Domain.Entities;

namespace TMS.Application.Interfaces.Repositories
{
    public interface ITyreRepository
    {
        #region Query Methods
        Task<Tyre?> FindByIdAsync(int id);
        Task<Tyre?> FindByCodeAsync(string code);
        Task<List<Tyre>> FindByOperatorIdAsync(int operatorId);
        Task<List<Tyre>> GetAllAsync();
        #endregion

        #region Command Methods
        Task AddAsync(Tyre tyre);
        Task SaveChangesAsync();
        #endregion
    }
}
