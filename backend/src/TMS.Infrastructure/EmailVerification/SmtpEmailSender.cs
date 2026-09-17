using TMS.Application.Interfaces.Communication;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace TMS.Infrastructure.EmailVerification
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly IConfiguration _configuration;

        public SmtpEmailSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var host = _configuration["Smtp:Host"]
                ?? throw new InvalidOperationException("Smtp host is not configured");
            var port = int.Parse(_configuration["Smtp:Port"]
                ?? throw new InvalidOperationException("Smtp port is not configured"));
            var username = _configuration["Smtp:Username"]
                ?? throw new InvalidOperationException("Smtp username in not configured");
            var password = _configuration["Smtp:Password"]
                ?? throw new InvalidOperationException("Smtp password in not configured");
            var form = _configuration["Smtp:From"] ?? username;
            var enableSsl = bool.Parse(_configuration["Smtp:EnableSsl"] ?? "true");

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = enableSsl,
            };

            using var message = new MailMessage
            {
                From = new MailAddress(form),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true,
            };
            message.To.Add(toEmail);
            await client.SendMailAsync(message);
        }
    }
}
