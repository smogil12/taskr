import { Resend } from 'resend';
import * as crypto from 'crypto';

// Initialize Resend only if API key is provided and not a placeholder
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder_key_for_staging' && process.env.RESEND_API_KEY !== 're_your_resend_api_key_here') {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export interface EmailVerificationData {
  name: string;
  email: string;
  verificationToken: string;
}

export interface TeamInvitationData {
  email: string;
  inviterName: string;
  invitationUrl: string;
  role: string;
}

export interface PasswordResetData {
  email: string;
  name: string;
  resetToken: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'Taskr <notifications@notifications.tailapp.ai>';
  private static readonly VERIFICATION_EXPIRY_HOURS = 24;

  /**
   * Generate a secure verification token
   */
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Calculate verification token expiry date
   */
  static getVerificationExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + this.VERIFICATION_EXPIRY_HOURS);
    return expiry;
  }

  /**
   * Send email verification email
   */
  static async sendVerificationEmail(data: EmailVerificationData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!resend) {
        console.log('Email service not configured - skipping verification email for:', data.email);
        return { success: true }; // Return success in staging mode
      }

      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${data.verificationToken}`;
      
      const { data: emailData, error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [data.email],
        subject: 'Verify your email address - Taskr',
        html: this.getVerificationEmailTemplate(data.name, verificationUrl),
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: 'Failed to send verification email' };
      }

      console.log('Verification email sent successfully:', emailData);
      return { success: true };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Failed to send verification email' };
    }
  }


  /**
   * Send team invitation email
   */
  static async sendTeamInvitationEmail(data: TeamInvitationData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!resend) {
        console.log('Email service not configured - skipping team invitation email for:', data.email);
        return { success: true }; // Don't fail if email service is not configured
      }

      const { data: emailData, error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [data.email],
        subject: `Join ${data.inviterName}'s team on Taskr - Complete your account setup`,
        html: this.getTeamInvitationEmailTemplate(data.inviterName, data.invitationUrl, data.role),
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: 'Failed to send team invitation email' };
      }

      console.log('Team invitation email sent successfully:', emailData);
      return { success: true };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Failed to send team invitation email' };
    }
  }

  /**
   * Get email verification template
   */
  private static getVerificationEmailTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email - Taskr</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            .content {
              background: #f8fafc;
              padding: 30px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              background: #2563eb;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .warning {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Taskr</div>
          </div>
          
          <div class="content">
            <h1>Welcome to Taskr, ${name}!</h1>
            <p>Thank you for signing up. To complete your registration and start using Taskr, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
            
            <div class="warning">
              <strong>Important:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification email.
            </div>
            
            <p>If you didn't create an account with Taskr, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent by Taskr. If you have any questions, please contact our support team.</p>
          </div>
        </body>
      </html>
    `;
  }


  /**
   * Get team invitation email template
   */
  private static getTeamInvitationEmailTemplate(inviterName: string, invitationUrl: string, role: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're invited to join a team - Taskr</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            .content {
              background: #f8fafc;
              padding: 30px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              background: #2563eb;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .role-badge {
              display: inline-block;
              background: #dbeafe;
              color: #1e40af;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              text-transform: uppercase;
            }
            .info-box {
              background: #f0f9ff;
              border: 1px solid #0ea5e9;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              color: #0c4a6e;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Taskr</div>
          </div>
          
          <div class="content">
            <h1>You're invited to join ${inviterName}'s team!</h1>
            <p><strong>${inviterName}</strong> has invited you to join their existing team on Taskr as a <span class="role-badge">${role.toLowerCase()}</span>.</p>
            
            <p><strong>This is NOT a request to create a new account.</strong> You're being added to an existing team where you'll collaborate on projects and tasks together.</p>
            
            <div style="text-align: center;">
              <a href="${invitationUrl}" class="button">Accept Invitation</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${invitationUrl}</p>
            
            <div class="info-box">
              <strong>What happens next?</strong><br>
              • Click the invitation link to join ${inviterName}'s team<br>
              • Create your password to complete your account setup<br>
              • You'll immediately have access to the team's projects and tasks<br>
              • Start collaborating with your team right away
            </div>
            
            <p>If you don't want to join this team, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent by Taskr. If you have any questions, please contact our support team.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, resetToken: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!resend) {
        console.log('Email service not configured - skipping password reset email for:', email);
        return { success: true }; // Return success in staging mode
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const { data, error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [email],
        subject: 'Reset your Taskr password',
        html: this.getPasswordResetEmailTemplate(name, resetUrl),
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message };
      }

      console.log('Password reset email sent successfully:', data?.id);
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: 'Failed to send password reset email' };
    }
  }

  /**
   * Get password reset email template
   */
  private static getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - Taskr</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
              <p style="margin: 10px 0 0 0; color: #e2e8f0; font-size: 16px;">Taskr Project Management</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Hi ${name},</h2>
              
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your Taskr account. If you made this request, click the button below to reset your password.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  Reset Password
                </a>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, you can also copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0 0; word-break: break-all; color: #3b82f6; font-size: 14px;">
                ${resetUrl}
              </p>
              
              <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 16px; font-weight: 600;">Important Security Information:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.6;">
                  <li>This link will expire in 1 hour for security</li>
                  <li>If you didn't request this reset, you can safely ignore this email</li>
                  <li>Your password won't be changed until you click the link above</li>
                </ul>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                If you're having trouble with the link above, please contact our support team.
              </p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                This email was sent by Taskr. If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
