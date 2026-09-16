using TMS.Application.DTOs.AuthDTOs;
using TMS.Application.DTOs.EmailVerificationDTOs;

namespace TMS.Application.Interfaces.Authentication;

public interface IAuthServices
{
    #region Authentication Operations
    Task<MessageResponseDTO> RegisterAsync(RegistrationDTO dto);
    Task<AuthResponseDTO> LoginAsync(LogInDTO dto);
    Task<AuthResponseDTO> VerifyEmailAsync(VerifyEmailDto dto);
    Task<MessageResponseDTO> ResendVerificationCodeAsync(ResendVerificationCodeDTO dto);
    #endregion
}
