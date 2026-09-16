using TMS.Application.Interfaces.Authentication;
using TMS.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace TMS.Application
{
    public static class DependencyInjection
    {
        #region Service Registration
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<IAuthServices, AuthServices>();

            return services;
        }
        #endregion
    }
}
