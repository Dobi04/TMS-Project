using TMS.Application.DTOs.AuthDTOs;
using TMS.Application.DTOs.EmailVerificationDTOs;
using TMS.Application.Interfaces.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Security.Claims;
using MySqlConnector;

namespace TMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        #region Constants and Constructors
        private readonly IAuthServices _authService;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthServices authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }
        #endregion

        #region Authentication Endpoints
        [HttpGet("me")]
        [EnableRateLimiting("auth")]
        [AllowAnonymous]
        public IActionResult Me()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var role = User.FindFirstValue(ClaimTypes.Role);

            return Ok(new { username, role });
        }

        [HttpPost("register")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> Register(RegistrationDTO dto)
        {
            try
            {
                var result = await _authService.RegisterAsync(dto);
                return Ok(result);

            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 }) // Duplicate entry error code for MySQL
            {
                return Ok(new MessageResponseDTO
                {
                    Message = "Registration successful. Please check your email for the verification code."
                });
            }
        }

        [HttpPost("login")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> Login(LogInDTO dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);
                SetAuthCookie(result.Token);
                result.Token = string.Empty;
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("authToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });
            return Ok(new { message = "Logged out successfully." });
        }

        [HttpPost("verify-email")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> VerifyEmail(VerifyEmailDto dto)
        {
            try
            {
                var result = await _authService.VerifyEmailAsync(dto);
                SetAuthCookie(result.Token);
                result.Token = string.Empty;
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                {
                    return BadRequest(new { message = ex.Message });
                }
            }
        }

        [HttpPost("resend-code")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ResendCode(ResendVerificationCodeDTO dto)
        {
            try
            {
                var result = await _authService.ResendVerificationCodeAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                {
                    return BadRequest(new { message = ex.Message });
                }
            }
        }
        #endregion

        #region Helpers
        private void SetAuthCookie(string token)
        {
            double minutes;
            if (!double.TryParse(_configuration["Jwt:ExpiresInMinutes"], out minutes))
                throw new InvalidOperationException("Jwt:ExpiresInMinutes in not configured correctly");
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(minutes),
                Path = "/"
            };
            Response.Cookies.Append("authToken", token, cookieOptions);
        }
        #endregion
    }
}
