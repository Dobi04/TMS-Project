namespace TMS.Application.Interfaces.Communication;

public interface IEmailSender
{
    Task SendEmailAsync(string toEmail, string subject, string htmlBody);
}
