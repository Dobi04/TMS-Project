using TMS.Application.DTOs.AuthDTOs;
using TMS.Application.DTOs.EmailVerificationDTOs;
using TMS.Application.Interfaces;
using TMS.Application.Interfaces.Authentication;
using TMS.Application.Interfaces.Communication;
using TMS.Application.Interfaces.Repositories;
using TMS.Application.Interfaces.Security;
using TMS.Domain.Entities;
using TMS.Domain.Enums;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Net;

namespace TMS.Application.Services;

public class AuthServices : IAuthServices
{
    #region Constants and Constructors
    private const int VerificationCodeValidityMinutes = 5;

    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailSender _emailSender;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ICurrentUserService _currentUserService;

    public AuthServices(
        IUserRepository userRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IPasswordHasher passwordHasher,
        IEmailSender emailSender,
        IAuditLogRepository auditLogRepository,
        ICurrentUserService currentUserService)
    {
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _passwordHasher = passwordHasher;
        _emailSender = emailSender;
        _auditLogRepository = auditLogRepository;
        _currentUserService = currentUserService;
    }
    #endregion

    #region Login
    public async Task<AuthResponseDTO> LoginAsync(LogInDTO dto)
    {
        var user = await _userRepository.FindByUsernameAsync(dto.Username);
        if (user == null || !_passwordHasher.Verify(dto.Password, user.PasswordHash))
        {
            await LogLoginAsync(user, dto.Username, AuditAction.LoginFailed, "Wrong username or password");
            throw new UnauthorizedAccessException("Wrong username or password");
        }

        if (!user.IsEmailVerified)
        {
            await LogLoginAsync(user, dto.Username, AuditAction.LoginFailed, "Email is not verified");
            throw new UnauthorizedAccessException("Email is not verified, please verify your email before logging in");
        }

        if (!user.IsActive)
        {
            await LogLoginAsync(user, dto.Username, AuditAction.LoginFailed, "Wrong username or password");
            throw new UnauthorizedAccessException("Wrong username or password");
        }

        await LogLoginAsync(user, dto.Username, AuditAction.Login, null);

        return new AuthResponseDTO
        {
            Token = _jwtTokenGenerator.GenerateToken(user),
            Username = user.Username,
            Role = user.Role.ToString()
        };
    }

    private async Task LogLoginAsync(User? user, string username, AuditAction action, string? reason)
    {
        await _auditLogRepository.AddAsync(new AuditLog
        {
            EntityName = nameof(User),
            EntityId = user?.Id.ToString() ?? username,
            Action = action,
            UserId = user?.Id,
            Username = user?.Username ?? username,
            IpAddress = _currentUserService.IpAddress,
            Timestamp = DateTime.UtcNow,
            NewValues = JsonSerializer.Serialize(new { reason })
        });

        await _auditLogRepository.SaveChangesAsync();
    }
    #endregion

    #region Registration
    public async Task<MessageResponseDTO> RegisterAsync(RegistrationDTO dto)
    {
        var existingUsername = await _userRepository.FindByUsernameAsync(dto.Username);
        var existingEmail = await _userRepository.FindByEmailAsync(dto.Email);
        if (existingUsername != null || existingEmail != null)
            return new MessageResponseDTO
            {
                Message = "Registration successful. Please check your email for the verification code."
            };

        var pendingUsername = await _userRepository.FindPendingByUsernameAsync(dto.Username);
        var pendingEmail = await _userRepository.FindPendingByEmailAsync(dto.Email);

        var now = DateTime.UtcNow;
        var isUsernameLocked = pendingUsername != null && pendingUsername.VerificationCodeExpiry >= now;
        var isEmailLocked = pendingEmail != null && pendingEmail.VerificationCodeExpiry >= now;

        if (isEmailLocked || isUsernameLocked)
            return new MessageResponseDTO
            {
                Message = "Registration successful. Please check your email for the verification code."
            };

        if (pendingUsername != null)
            await _userRepository.RemovePendingAsync(pendingUsername);
        if (pendingEmail != null)
            await _userRepository.RemovePendingAsync(pendingEmail);

        var code = GenerateVerificationCode();
        var pendingRegistration = new PendingUserRegistration
        {
            Name = dto.Name,
            Surname = dto.Surname,
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            VerificationCode = code,
            VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(VerificationCodeValidityMinutes)
        };

        await _userRepository.AddPendingAsync(pendingRegistration);
        await _userRepository.SaveChangesAsync();
        var safeName = WebUtility.HtmlEncode(pendingRegistration.Name);
        await _emailSender.SendEmailAsync(
            pendingRegistration.Email,
            "Verifikacija naloga",
            $"<p>Zdravo {pendingRegistration.Name},</p><p>Tvoj verifikacioni kod je: <b>{code}</b></p>" +
            $"<p>Kod važi {VerificationCodeValidityMinutes} minuta.</p>");

        return new MessageResponseDTO
        {
            Message = "Registration successful. Please check your email for the verification code."
        };
    }
    #endregion

    #region Email Verification
    public async Task<MessageResponseDTO> ResendVerificationCodeAsync(ResendVerificationCodeDTO dto)
    {
        var pendingRegistration = await _userRepository.FindPendingByEmailAsync(dto.Email);
        if (pendingRegistration == null)
        {
            return new MessageResponseDTO { Message = "A new code has been sent." };
        }

        var code = GenerateVerificationCode();
        pendingRegistration.VerificationCode = code;
        pendingRegistration.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(VerificationCodeValidityMinutes);

        await _userRepository.SaveChangesAsync();
        await _emailSender.SendEmailAsync(
            pendingRegistration.Email,
            "Verifikacija naloga",
            $"<p>Tvoj novi verifikacioni kod je: <b>{code}</b></p>" +
            $"<p>Kod važi {VerificationCodeValidityMinutes} minuta.</p>");

        return new MessageResponseDTO { Message = "A new code has been sent." };
    }

    public async Task<AuthResponseDTO> VerifyEmailAsync(VerifyEmailDto dto)
    {
        var pendingRegistration = await _userRepository.FindPendingByEmailAsync(dto.Email);
        if (pendingRegistration == null)
            throw new InvalidOperationException("Invalid email or verification code");

        var expectedCode = Encoding.UTF8.GetBytes(pendingRegistration.VerificationCode);
        var providedCode = Encoding.UTF8.GetBytes(dto.Code ?? string.Empty);
        if (expectedCode.Length != providedCode.Length ||
            !CryptographicOperations.FixedTimeEquals(expectedCode, providedCode))
            throw new InvalidOperationException("Invalid email or verification code");

        if (pendingRegistration.VerificationCodeExpiry < DateTime.UtcNow)
            throw new InvalidOperationException("Verification code has expired please request a new one");

        var user = new User
        {
            Name = pendingRegistration.Name,
            Surname = pendingRegistration.Surname,
            Username = pendingRegistration.Username,
            Email = pendingRegistration.Email,
            PasswordHash = pendingRegistration.PasswordHash,
            IsEmailVerified = true
        };

        await _userRepository.Add(user);
        await _userRepository.RemovePendingAsync(pendingRegistration);
        await _userRepository.SaveChangesAsync();

        return new AuthResponseDTO
        {
            Token = _jwtTokenGenerator.GenerateToken(user),
            Username = user.Username,
            Role = user.Role.ToString()
        };
    }

    private static string GenerateVerificationCode()
    {
        return RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
    }
    #endregion
}