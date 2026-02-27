<?php

namespace App\Notifications;

use App\Models\CompanyInvitation;
use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CompanyInvitationNotification extends Notification
{

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public CompanyInvitation $invitation
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        // Enhanced logging for email debugging
        \Log::info('CompanyInvitationNotification::toMail called', [
            'invitation_id' => $this->invitation->id,
            'email' => $this->invitation->email,
            'accepted_at' => $this->invitation->accepted_at,
            'has_temp_password' => !empty($this->invitation->temporary_password),
            'company_id' => $this->invitation->company_id,
            'company_name' => $this->invitation->company->name ?? 'N/A',
            'mailer' => config('mail.default'),
            'mail_host' => config('mail.mailers.smtp.host'),
            'mail_port' => config('mail.mailers.smtp.port'),
            'mail_username' => config('mail.mailers.smtp.username') ? 'SET' : 'NOT SET',
            'mail_password' => config('mail.mailers.smtp.password') ? 'SET' : 'NOT SET',
            'timestamp' => now()->toIso8601String(),
        ]);
        
        $company = $this->invitation->company;
        $inviter = $this->invitation->inviter;
        $project = $this->invitation->hrProject;
        
        // Get company logo URL
        $companyLogo = null;
        if ($company->logo_path) {
            if (str_starts_with($company->logo_path, 'http://') || str_starts_with($company->logo_path, 'https://')) {
                $companyLogo = $company->logo_path;
            } elseif (str_starts_with($company->logo_path, '/storage/')) {
                $companyLogo = url($company->logo_path);
            } else {
                $companyLogo = asset('storage/' . $company->logo_path);
            }
        }
        
        // Get company logo URL
        $companyLogo = null;
        if ($company->logo_path) {
            if (str_starts_with($company->logo_path, 'http://') || str_starts_with($company->logo_path, 'https://')) {
                $companyLogo = $company->logo_path;
            } elseif (str_starts_with($company->logo_path, '/storage/')) {
                $companyLogo = url($company->logo_path);
            } else {
                $companyLogo = asset('storage/' . $company->logo_path);
            }
        }
        
        // If invitation is accepted, send welcome email
        if ($this->invitation->accepted_at) {
            $loginUrl = route('login');
            
            // New user - send credentials email
            if ($this->invitation->temporary_password) {
                $subject = '🎉 Welcome to ' . $company->name . ' - Your CEO Account is Ready!';
                $greeting = 'Welcome to HR Path-Finder!';
                
                $content = '<p style="margin: 10px 0; color: #4b5563; font-size: 16px; line-height: 1.6;"><strong>Congratulations!</strong> Your CEO account for <strong>' . e($company->name) . '</strong> has been successfully created.</p>';
                $content .= '<p style="margin: 10px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">' . e($inviter->name) . ' has set up your account and you are now ready to begin your journey with HR Path-Finder.</p>';
                
                $content .= '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; background-color: #f3f4f6; border: 2px solid #d1d5db; border-radius: 8px; padding: 20px;">';
                $content .= '<tr><td>';
                $content .= '<p style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">🔐 Your Login Credentials:</p>';
                $content .= '<p style="margin: 5px 0; color: #1f2937; font-size: 14px; font-family: monospace;"><strong>Email:</strong> ' . e($this->invitation->email) . '</p>';
                $content .= '<p style="margin: 5px 0; color: #1f2937; font-size: 14px; font-family: monospace;"><strong>Temporary Password:</strong> ' . e($this->invitation->temporary_password) . '</p>';
                $content .= '</td></tr></table>';
                
                $content .= '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 15px;">';
                $content .= '<tr><td>';
                $content .= '<p style="margin: 0; color: #92400e; font-size: 14px;"><strong>⚠️ Security Notice:</strong> Please change your password immediately after your first login for security purposes.</p>';
                $content .= '</td></tr></table>';
                
                if ($project) {
                    $content .= '<p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📋 Project Assignment:</p>';
                    $content .= '<p style="margin: 5px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">You have been assigned to the HR transformation project for <strong>' . e($company->name) . '</strong>.</p>';
                    $content .= '<p style="margin: 5px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">This project will help shape the future of your organization\'s human resources strategy.</p>';
                }
                
                $content .= '<p style="margin: 20px 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">🚀 What you can do now:</p>';
                $content .= '<ul style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">';
                $content .= '<li>✅ Review and modify company information</li>';
                $content .= '<li>✅ Complete the Management Philosophy Survey (required for project progression)</li>';
                $content .= '<li>✅ Collaborate on the HR project with the HR Manager</li>';
                $content .= '<li>✅ Review and approve HR strategy steps</li>';
                $content .= '<li>✅ Provide strategic input on performance and compensation systems</li>';
                $content .= '<li>✅ Access comprehensive HR analytics and insights</li>';
                $content .= '</ul>';
                
                $outro = '<p style="margin: 20px 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📝 Next Steps:</p>';
                $outro .= '<ol style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">';
                $outro .= '<li>Login using the credentials above</li>';
                $outro .= '<li>Change your password immediately</li>';
                $outro .= '<li>Complete the Management Philosophy Survey</li>';
                $outro .= '<li>Start collaborating with your HR Manager</li>';
                $outro .= '</ol>';
                $outro .= '<p style="margin: 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">If you have any questions or did not expect this invitation, please contact ' . e($inviter->name) . ' immediately.</p>';
                
                return (new MailMessage)
                    ->subject($subject)
                    ->view('emails.ceo-invitation', [
                        'subject' => $subject,
                        'greeting' => $greeting,
                        'content' => $content,
                        'loginUrl' => $loginUrl,
                        'outro' => $outro,
                        'salutation' => 'Best regards,<br>The HR Path-Finder Team',
                        'companyLogo' => $companyLogo,
                        'companyName' => $company->name,
                    ]);
            } else {
                // Existing user - send welcome email
                $subject = '🎉 Welcome! You\'re Now CEO of ' . $company->name;
                $greeting = 'Welcome back to HR Path-Finder!';
                
                $content = '<p style="margin: 10px 0; color: #4b5563; font-size: 16px; line-height: 1.6;"><strong>Great news!</strong> <strong>' . e($inviter->name) . '</strong> has assigned you as <strong>CEO</strong> for <strong>' . e($company->name) . '</strong>.</p>';
                $content .= '<p style="margin: 10px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Your invitation has been accepted and you are now ready to lead the HR transformation journey.</p>';
                
                if ($project) {
                    $content .= '<p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📋 Project Assignment:</p>';
                    $content .= '<p style="margin: 5px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">You have been assigned to the HR transformation project for <strong>' . e($company->name) . '</strong>.</p>';
                    $content .= '<p style="margin: 5px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">This comprehensive project will help establish a strategic HR framework for your organization.</p>';
                    $content .= '<p style="margin: 5px 0; color: #4b5563; font-size: 16px; line-height: 1.6;"><strong>Your first task:</strong> Please complete the Management Philosophy Survey to proceed with the project.</p>';
                }
                
                $content .= '<p style="margin: 20px 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">🎯 What you need to do:</p>';
                $content .= '<ul style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">';
                $content .= '<li>✅ Complete the Management Philosophy Survey (if not already done)</li>';
                $content .= '<li>✅ Review and verify HR strategy steps</li>';
                $content .= '<li>✅ Collaborate with the HR Manager on the project</li>';
                $content .= '<li>✅ Provide strategic direction and approvals</li>';
                $content .= '<li>✅ Review performance and compensation system recommendations</li>';
                $content .= '</ul>';
                
                $outro = '<p style="margin: 20px 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">💡 Tips for Success:</p>';
                $outro .= '<ul style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">';
                $outro .= '<li>Take your time with the Management Philosophy Survey - it shapes the entire project</li>';
                $outro .= '<li>Review each step carefully before approval</li>';
                $outro .= '<li>Communicate regularly with your HR Manager</li>';
                $outro .= '<li>Use the dashboard to track project progress</li>';
                $outro .= '</ul>';
                $outro .= '<p style="margin: 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">If you have any questions or did not expect this invitation, please contact ' . e($inviter->name) . ' immediately.</p>';
                
                return (new MailMessage)
                    ->subject($subject)
                    ->view('emails.ceo-invitation', [
                        'subject' => $subject,
                        'greeting' => $greeting,
                        'content' => $content,
                        'loginUrl' => $loginUrl,
                        'outro' => $outro,
                        'salutation' => 'Best regards,<br>The HR Path-Finder Team',
                        'companyLogo' => $companyLogo,
                        'companyName' => $company->name,
                    ]);
            }
        } else {
            // Initial invitation email (before acceptance)
            $acceptUrl = route('invitations.accept', ['token' => $this->invitation->token]);
            $rejectUrl = route('invitations.reject', ['token' => $this->invitation->token]);
            
            $expiresAt = $this->invitation->expires_at 
                ? $this->invitation->expires_at->format('F j, Y \a\t g:i A') 
                : '7 days from now';
            
            $subject = '🎯 CEO Invitation: Join ' . $company->name . ' on HR Path-Finder';
            $greeting = 'Dear Future CEO,';
            
            $content = '<p style="margin: 10px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">We are excited to inform you that <strong>' . e($inviter->name) . '</strong> has invited you to join <strong>' . e($company->name) . '</strong> as <strong>Chief Executive Officer (CEO)</strong> on HR Path-Finder.</p>';
            $content .= '<p style="margin: 10px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">This is an important opportunity to lead and shape the human resources strategy for your organization.</p>';
            
            if ($project) {
                $content .= '<p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📋 Project Assignment:</p>';
                $content .= '<p style="margin: 5px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">You have been invited to participate in a comprehensive HR transformation project for <strong>' . e($company->name) . '</strong>.</p>';
                $content .= '<p style="margin: 5px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">As the CEO, your leadership and strategic vision will be essential in:</p>';
                $content .= '<ul style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">';
                $content .= '<li>Defining the company\'s management philosophy</li>';
                $content .= '<li>Shaping organizational design and structure</li>';
                $content .= '<li>Establishing performance and compensation systems</li>';
                $content .= '<li>Creating a strategic HR framework that aligns with your business goals</li>';
                $content .= '</ul>';
            } else {
                $content .= '<p style="margin: 15px 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">Your Role as CEO:</p>';
                $content .= '<p style="margin: 5px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">As the CEO, you will play a crucial role in:</p>';
                $content .= '<ul style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">';
                $content .= '<li>Defining the company\'s management philosophy and values</li>';
                $content .= '<li>Shaping HR strategy and organizational design</li>';
                $content .= '<li>Reviewing and approving key HR initiatives</li>';
                $content .= '<li>Providing strategic direction for the organization</li>';
                $content .= '</ul>';
            }
            
            $content .= '<p style="margin: 20px 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">✨ What you will be able to do:</p>';
            $content .= '<ul style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">';
            $content .= '<li>✅ Review and modify company information</li>';
            $content .= '<li>✅ Complete the Management Philosophy Survey</li>';
            $content .= '<li>✅ Collaborate on HR projects with the HR Manager</li>';
            $content .= '<li>✅ Review and approve HR strategy steps</li>';
            $content .= '<li>✅ Provide strategic input on performance and compensation systems</li>';
            $content .= '<li>✅ Access comprehensive HR analytics and insights</li>';
            $content .= '</ul>';
            
            $outro = '<p style="margin: 20px 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">⏰ Important Details:</p>';
            $outro .= '<ul style="margin: 10px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">';
            $outro .= '<li><strong>Invitation Expires:</strong> ' . e($expiresAt) . '</li>';
            $outro .= '<li><strong>Invited By:</strong> ' . e($inviter->name) . '</li>';
            
            // Check if user already exists
            $existingUser = User::where('email', $this->invitation->email)->first();
            if ($existingUser) {
                $outro .= '<li><strong>Your Account:</strong> You already have an account - you can use your existing credentials to login</li>';
                $outro .= '<li><strong>After Acceptance:</strong> You will receive a welcome email with detailed project information and next steps</li>';
            } else {
                $outro .= '<li><strong>New Account:</strong> After accepting, you will receive your login credentials via email</li>';
                $outro .= '<li><strong>Email Verification:</strong> Your email will be automatically verified upon acceptance</li>';
                $outro .= '<li><strong>Security:</strong> Please change your password after your first login</li>';
            }
            $outro .= '</ul>';
            
            $outro .= '<p style="margin: 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;"><strong>Questions?</strong> If you have any questions about this invitation, please contact ' . e($inviter->name) . ' directly.</p>';
            $outro .= '<p style="margin: 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">If you did not expect this invitation, please contact ' . e($inviter->name) . ' to clarify.</p>';
            
            return (new MailMessage)
                ->subject($subject)
                ->view('emails.ceo-invitation', [
                    'subject' => $subject,
                    'greeting' => $greeting,
                    'content' => $content,
                    'acceptUrl' => $acceptUrl,
                    'rejectUrl' => $rejectUrl,
                    'outro' => $outro,
                    'salutation' => 'Best regards,<br>The HR Path-Finder Team',
                    'companyLogo' => $companyLogo,
                    'companyName' => $company->name,
                ]);
        }
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'invitation_id' => $this->invitation->id,
            'company_id' => $this->invitation->company_id,
            'company_name' => $this->invitation->company->name,
            'role' => $this->invitation->role,
        ];
    }
}
