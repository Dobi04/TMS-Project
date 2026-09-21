using TMS.Application.Interfaces.Communication;
using TMS.Application.Interfaces.Repositories;
using TMS.Application.Interfaces.Security;
using TMS.Infrastructure.EmailVerification;
using TMS.Infrastructure.Persistence;
using TMS.Infrastructure.Persistence.Configurations.Repositories;
using TMS.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace TMS.Infrastructure
{
    public static class DependencyInjection
    {
        #region Infrastructure Registration
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection is not configured.");

            services.AddDbContext<AppDbContext>((serviceProvider, options) =>
            {
                options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 0)));
                options.AddInterceptors(serviceProvider.GetRequiredService<AuditSaveChangesInterceptor>());
            });

            services.AddScoped<AuditSaveChangesInterceptor>();

            services.AddScoped<IPasswordHasher, PasswordHasher>();
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IEmailSender, SmtpEmailSender>();

            services.AddScoped<IMachineRepository, MachineRepository>();
            services.AddScoped<ITyreRepository, TyreRepository>();
            services.AddScoped<ISalesRepository, SalesRepository>();
            services.AddScoped<IAuditLogRepository, AuditLogRepository>();

            return services;
        }
        #endregion
    }
}
