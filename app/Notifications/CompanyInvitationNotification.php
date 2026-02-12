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
        // #region agent log
        \Log::info('CompanyInvitationNotification::toMail called', [
            'invitation_id' => $this->invitation->id,
            'email' => $this->invitation->email,
            'accepted_at' => $this->invitation->accepted_at,
            'has_temp_password' => !empty($this->invitation->temporary_password),
        ]);
        // #endregion
        
        $company = $this->invitation->company;
        $inviter = $this->invitation->inviter;
        $project = $this->invitation->hrProject;
        
        // If invitation is accepted, send welcome email
        if ($this->invitation->accepted_at) {
            $loginUrl = route('login');
            
            // New user - send credentials email
            if ($this->invitation->temporary_password) {
                $mail = (new MailMessage)
                    ->subject('Welcome to ' . $company->name . ' - Your CEO Account Credentials')
                    ->greeting('Welcome!')
                    ->line($inviter->name . ' has created your CEO account for **' . $company->name . '** on HR Path-Finder.')
                    ->line('**Your Login Credentials:**')
                    ->line('**Email:** ' . $this->invitation->email)
                    ->line('**Password:** ' . $this->invitation->temporary_password)
                    ->line('**Important:** Please change your password after your first login for security.');
                
                if ($project) {
                    $mail->line('**Project Assignment:**')
                        ->line('You have been assigned to the HR project for **' . $company->name . '**.');
                }
                
                $mail->line('**What you can do:**')
                    ->line('• Review and modify company information')
                    ->line('• Complete the Management Philosophy Survey')
                    ->line('• Collaborate on the HR project with the HR Manager')
                    ->line('• Review and approve HR strategy steps')
                    ->action('Login to Your Account', $loginUrl)
                    ->line('We recommend changing your password after your first login.')
                    ->line('If you did not expect this invitation, please contact ' . $inviter->name . ' immediately.');
            } else {
                // Existing user - send welcome email
                $mail = (new MailMessage)
                    ->subject('Welcome to ' . $company->name . ' - CEO Project Assignment')
                    ->greeting('Welcome back!')
                    ->line($inviter->name . ' has assigned you as CEO for **' . $company->name . '** on HR Path-Finder.');
                
                if ($project) {
                    $mail->line('**Project Assignment:**')
                        ->line('You have been assigned to the HR project for **' . $company->name . '**.')
                        ->line('Please complete the Management Philosophy Survey to proceed with the project.');
                }
                
                $mail->line('**What you need to do:**')
                    ->line('• Complete the Management Philosophy Survey')
                    ->line('• Review and verify HR strategy steps')
                    ->line('• Collaborate with the HR Manager on the project')
                    ->action('Login to Your Account', $loginUrl)
                    ->line('If you did not expect this invitation, please contact ' . $inviter->name . ' immediately.');
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
                ->greeting('Hello!')
                ->line('**' . $inviter->name . '** has invited you to join **' . $company->name . '** as **CEO** on HR Path-Finder.');
            
            if ($project) {
                $mail->line('**Project Assignment:**')
                    ->line('You have been invited to participate in the HR project for **' . $company->name . '**.')
                    ->line('As the CEO, you will play a crucial role in shaping the HR strategy and organizational design for your company.');
            } else {
                $mail->line('As the CEO, you will play a crucial role in shaping the HR strategy and organizational design for your company.');
            }
            
            $mail->line('**What you will be able to do:**')
                ->line('✅ Review and modify company information')
                ->line('✅ Complete the Management Philosophy Survey')
                ->line('✅ Collaborate on the HR project with the HR Manager')
                ->line('✅ Review and approve HR strategy steps')
                ->line('✅ Provide strategic input on performance and compensation systems')
                ->action('🎉 Accept Invitation', $acceptUrl)
                ->line('**Important Details:**')
                ->line('• **Expires:** ' . $expiresAt);
            
            // Check if user already exists
            $existingUser = User::where('email', $this->invitation->email)->first();
            if ($existingUser) {
                $mail->line('• After accepting, you will receive a welcome email with project details')
                    ->line('• You can use your existing account credentials to login');
            } else {
                $mail->line('• After accepting, you will receive your login credentials via email')
                    ->line('• Your email will be automatically verified upon acceptance');
            }
            
            $mail->line('**Not interested?**')
                ->line('If you do not wish to accept this invitation, you can [reject it here](' . $rejectUrl . ').')
                ->line('If you did not expect this invitation, you can safely ignore this email or reject it using the link above.')
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
