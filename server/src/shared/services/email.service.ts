import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { log } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email Service using SMTP
 *
 * This service handles sending emails via SMTP.
 * Supports OTP verification emails, password reset emails, etc.
 */
class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
      log.warn('SMTP credentials not configured. Email service will be disabled.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE, // true for 465, false for other ports
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });

      log.info('Email service initialized successfully');
    } catch (error: any) {
      log.error('Failed to initialize email service', { error: error.message });
    }
  }

  /**
   * Send OTP verification email
   */
  async sendOTP(email: string, otp: string, name?: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const subject = 'Your Verification Code';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1a73e8;
              margin: 0;
              font-size: 24px;
            }
            .content {
              background-color: white;
              border-radius: 6px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .otp-code {
              background-color: #f1f3f4;
              border: 2px dashed #1a73e8;
              border-radius: 6px;
              padding: 20px;
              text-align: center;
              margin: 25px 0;
            }
            .otp-code .code {
              font-size: 32px;
              font-weight: bold;
              color: #1a73e8;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .info {
              color: #666;
              font-size: 14px;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ZenvyGo</h1>
            </div>
            <div class="content">
              <p>Hello ${name || 'there'},</p>
              <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>

              <div class="otp-code">
                <div class="code">${otp}</div>
              </div>

              <p>This code will expire in <strong>5 minutes</strong>.</p>

              <div class="info">
                <p><strong>Security Tips:</strong></p>
                <ul>
                  <li>Never share this code with anyone</li>
                  <li>We will never ask for your verification code</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} ZenvyGo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hello ${name || 'there'},

Your verification code is: ${otp}

This code will expire in 5 minutes.

Never share this code with anyone. If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} ZenvyGo. All rights reserved.
    `.trim();

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });

    log.info('OTP email sent successfully', { email: this.maskEmail(email) });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetOTP(email: string, otp: string, name?: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const subject = 'Reset Your Password';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1a73e8;
              margin: 0;
              font-size: 24px;
            }
            .content {
              background-color: white;
              border-radius: 6px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .otp-code {
              background-color: #fff3cd;
              border: 2px dashed #ff9800;
              border-radius: 6px;
              padding: 20px;
              text-align: center;
              margin: 25px 0;
            }
            .otp-code .code {
              font-size: 32px;
              font-weight: bold;
              color: #ff9800;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .info {
              color: #666;
              font-size: 14px;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ff9800;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ZenvyGo</h1>
            </div>
            <div class="content">
              <p>Hello ${name || 'there'},</p>
              <p>We received a request to reset your password. Use the verification code below to proceed:</p>

              <div class="otp-code">
                <div class="code">${otp}</div>
              </div>

              <p>This code will expire in <strong>5 minutes</strong>.</p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request a password reset, please ignore this email and your password will remain unchanged.
              </div>

              <div class="info">
                <p><strong>Security Tips:</strong></p>
                <ul>
                  <li>Never share this code with anyone</li>
                  <li>ZenvyGo staff will never ask for your verification code</li>
                  <li>Always verify the sender's email address</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} ZenvyGo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hello ${name || 'there'},

We received a request to reset your password.

Your password reset code is: ${otp}

This code will expire in 5 minutes.

If you didn't request a password reset, please ignore this email.

© ${new Date().getFullYear()} ZenvyGo. All rights reserved.
    `.trim();

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });

    log.info('Password reset email sent successfully', { email: this.maskEmail(email) });
  }

  /**
   * Generic email sending method
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      log.debug('Email sent', { messageId: info.messageId });
    } catch (error: any) {
      log.error('Failed to send email', {
        error: error.message,
        to: this.maskEmail(options.to),
      });
      throw new Error('Failed to send email. Please try again later.');
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      log.warn('Email service not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      log.info('SMTP connection verified successfully');
      return true;
    } catch (error: any) {
      log.error('SMTP connection failed', { error: error.message });
      return false;
    }
  }

  /**
   * Mask email address for logging
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***@***.***';

    const maskedLocal = localPart.length > 3
      ? `${localPart.slice(0, 2)}***${localPart.slice(-1)}`
      : `${localPart[0]}***`;

    return `${maskedLocal}@${domain}`;
  }
}

export const emailService = new EmailService();
