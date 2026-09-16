using TMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace TMS.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users => Set<User>();
        public DbSet<PendingUserRegistration> PendingUserRegistrations => Set<PendingUserRegistration>();
        public DbSet<Machine> Machines => Set<Machine>();
        public DbSet<Tyre> Tyres => Set<Tyre>();
        public DbSet<Sales> Sales => Set<Sales>();
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
            base.OnModelCreating(modelBuilder);
        }
    }
}
