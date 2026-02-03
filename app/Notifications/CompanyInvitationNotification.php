<?php

namespace App\Notifications;

use App\Models\CompanyInvitation;
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
        $company = $this->invitation->company;
        $inviter = $this->invitation->inviter;
        
        // If invitation is accepted, send credentials email
        if ($this->invitation->accepted_at && $this->invitation->temporary_password) {
            $loginUrl = route('login');
            
            $mail = (new MailMessage)
                ->subject('Welcome to ' . $company->name . ' - Your CEO Account Credentials')
                ->greeting('Welcome!')
                ->line($inviter->name . ' has created your CEO account for **' . $company->name . '** on HR Path-Finder.')
                ->line('**Your Login Credentials:**')
                ->line('**Email:** ' . $this->invitation->email)
                ->line('**Password:** ' . $this->invitation->temporary_password)
                ->line('**Important:** Please change your password after your first login for security.')
                ->line('**What you can do:**')
                ->line('• Review and modify company information')
                ->line('• Complete the Management Philosophy Survey')
                ->line('• Collaborate on the HR project with the HR Manager')
                ->line('• Review and approve HR strategy steps')
                ->action('Login to Your Account', $loginUrl)
                ->line('We recommend changing your password after your first login.')
                ->line('If you did not expect this invitation, please contact ' . $inviter->name . ' immediately.');
        } else {
            // Initial invitation email (before acceptance)
            $acceptUrl = route('invitations.accept', ['token' => $this->invitation->token]);
            $rejectUrl = route('invitations.reject', ['token' => $this->invitation->token]);
            
            $mail = (new MailMessage)
                ->subject('Invitation to join ' . $company->name . ' as CEO on HR Path-Finder')
                ->greeting('Hello!')
                ->line($inviter->name . ' has invited you to join **' . $company->name . '** as CEO on HR Path-Finder.')
                ->line('**What you will be able to do:**')
                ->line('• Review and modify company information')
                ->line('• Complete the Management Philosophy Survey')
                ->line('• Collaborate on the HR project with the HR Manager')
                ->line('• Review and approve HR strategy steps')
                ->action('Accept Invitation', $acceptUrl)
                ->line('**Or reject this invitation:**')
                ->line('If you do not wish to accept this invitation, you can [reject it here](' . $rejectUrl . ').')
                ->line('After accepting, you will receive your login credentials via email.')
                ->line('**Email Verification:**')
                ->line('Your email will be automatically verified when you accept the invitation.')
                ->line('This invitation will expire in 7 days.')
                ->line('If you did not expect this invitation, you can safely ignore this email or reject it using the link above.');
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
