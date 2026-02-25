<?php

namespace App\Notifications;

use App\Models\CompanyInvitation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CompanyInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
        
        // If invitation is accepted, send welcome email
        if ($this->invitation->accepted_at) {
            $loginUrl = route('login');
            
            // New user - send credentials email
            if ($this->invitation->temporary_password) {
                $mail = (new MailMessage)
                    ->subject('🎉 Welcome to ' . $company->name . ' - Your CEO Account is Ready!')
                    ->greeting('Welcome to HR Path-Finder!')
                    ->line('Congratulations! Your CEO account for **' . $company->name . '** has been successfully created.')
                    ->line($inviter->name . ' has set up your account and you are now ready to begin your journey with HR Path-Finder.')
                    ->line('**🔐 Your Login Credentials:**')
                    ->line('**Email:** ' . $this->invitation->email)
                    ->line('**Temporary Password:** ' . $this->invitation->temporary_password)
                    ->line('**⚠️ Security Notice:** Please change your password immediately after your first login for security purposes.');
                
                if ($project) {
                    $mail->line('**📋 Project Assignment:**')
                        ->line('You have been assigned to the HR transformation project for **' . $company->name . '**.')
                        ->line('This project will help shape the future of your organization\'s human resources strategy.');
                }
                
                $mail->line('**🚀 What you can do now:**')
                    ->line('✅ Review and modify company information')
                    ->line('✅ Complete the Management Philosophy Survey (required for project progression)')
                    ->line('✅ Collaborate on the HR project with the HR Manager')
                    ->line('✅ Review and approve HR strategy steps')
                    ->line('✅ Provide strategic input on performance and compensation systems')
                    ->line('✅ Access comprehensive HR analytics and insights')
                    ->action('🔑 Login to Your Account', $loginUrl)
                    ->line('**📝 Next Steps:**')
                    ->line('1. Login using the credentials above')
                    ->line('2. Change your password immediately')
                    ->line('3. Complete the Management Philosophy Survey')
                    ->line('4. Start collaborating with your HR Manager')
                    ->line('If you have any questions or did not expect this invitation, please contact ' . $inviter->name . ' immediately.')
                    ->salutation('Best regards,<br>The HR Path-Finder Team');
            } else {
                // Existing user - send welcome email
                $mail = (new MailMessage)
                    ->subject('🎉 Welcome! You\'re Now CEO of ' . $company->name)
                    ->greeting('Welcome back to HR Path-Finder!')
                    ->line('Great news! **' . $inviter->name . '** has assigned you as **CEO** for **' . $company->name . '**.')
                    ->line('Your invitation has been accepted and you are now ready to lead the HR transformation journey.');
                
                if ($project) {
                    $mail->line('**📋 Project Assignment:**')
                        ->line('You have been assigned to the HR transformation project for **' . $company->name . '**.')
                        ->line('This comprehensive project will help establish a strategic HR framework for your organization.')
                        ->line('**Your first task:** Please complete the Management Philosophy Survey to proceed with the project.');
                }
                
                $mail->line('**🎯 What you need to do:**')
                    ->line('✅ Complete the Management Philosophy Survey (if not already done)')
                    ->line('✅ Review and verify HR strategy steps')
                    ->line('✅ Collaborate with the HR Manager on the project')
                    ->line('✅ Provide strategic direction and approvals')
                    ->line('✅ Review performance and compensation system recommendations')
                    ->action('🔑 Login to Your Account', $loginUrl)
                    ->line('**💡 Tips for Success:**')
                    ->line('• Take your time with the Management Philosophy Survey - it shapes the entire project')
                    ->line('• Review each step carefully before approval')
                    ->line('• Communicate regularly with your HR Manager')
                    ->line('• Use the dashboard to track project progress')
                    ->line('If you have any questions or did not expect this invitation, please contact ' . $inviter->name . ' immediately.')
                    ->salutation('Best regards,<br>The HR Path-Finder Team');
            }
            
            return $mail;
        } else {
            // Initial invitation email (before acceptance)
            $acceptUrl = route('invitations.accept', ['token' => $this->invitation->token]);
            $rejectUrl = route('invitations.reject', ['token' => $this->invitation->token]);
            
            $expiresAt = $this->invitation->expires_at 
                ? $this->invitation->expires_at->format('F j, Y \a\t g:i A') 
                : '7 days from now';
            
            $mail = (new MailMessage)
                ->subject('🎯 CEO Invitation: Join ' . $company->name . ' on HR Path-Finder')
                ->greeting('Dear Future CEO,')
                ->line('We are excited to inform you that **' . $inviter->name . '** has invited you to join **' . $company->name . '** as **Chief Executive Officer (CEO)** on HR Path-Finder.')
                ->line('This is an important opportunity to lead and shape the human resources strategy for your organization.');
            
            if ($project) {
                $mail->line('**📋 Project Assignment:**')
                    ->line('You have been invited to participate in a comprehensive HR transformation project for **' . $company->name . '**.')
                    ->line('As the CEO, your leadership and strategic vision will be essential in:')
                    ->line('• Defining the company\'s management philosophy')
                    ->line('• Shaping organizational design and structure')
                    ->line('• Establishing performance and compensation systems')
                    ->line('• Creating a strategic HR framework that aligns with your business goals');
            } else {
                $mail->line('**Your Role as CEO:**')
                    ->line('As the CEO, you will play a crucial role in:')
                    ->line('• Defining the company\'s management philosophy and values')
                    ->line('• Shaping HR strategy and organizational design')
                    ->line('• Reviewing and approving key HR initiatives')
                    ->line('• Providing strategic direction for the organization');
            }
            
            $mail->line('**✨ What you will be able to do:**')
                ->line('✅ Review and modify company information')
                ->line('✅ Complete the Management Philosophy Survey')
                ->line('✅ Collaborate on HR projects with the HR Manager')
                ->line('✅ Review and approve HR strategy steps')
                ->line('✅ Provide strategic input on performance and compensation systems')
                ->line('✅ Access comprehensive HR analytics and insights')
                ->action('🎉 Accept Invitation', $acceptUrl)
                ->line('**⏰ Important Details:**')
                ->line('• **Invitation Expires:** ' . $expiresAt)
                ->line('• **Invited By:** ' . $inviter->name);
            
            // Check if user already exists
            $existingUser = User::where('email', $this->invitation->email)->first();
            if ($existingUser) {
                $mail->line('• **Your Account:** You already have an account - you can use your existing credentials to login')
                    ->line('• **After Acceptance:** You will receive a welcome email with detailed project information and next steps');
            } else {
                $mail->line('• **New Account:** After accepting, you will receive your login credentials via email')
                    ->line('• **Email Verification:** Your email will be automatically verified upon acceptance')
                    ->line('• **Security:** Please change your password after your first login');
            }
            
            $mail->line('**❓ Not interested?**')
                ->line('If you are unable to accept this invitation or do not wish to participate, you can [reject the invitation here](' . $rejectUrl . ').')
                ->line('The HR manager will be notified of your decision.')
                ->line('If you did not expect this invitation, you can safely ignore this email or reject it using the link above.')
                ->line('**Questions?** If you have any questions about this invitation, please contact ' . $inviter->name . ' directly.')
                ->salutation('Best regards,<br>The HR Path-Finder Team');
        }

        return $mail;
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
