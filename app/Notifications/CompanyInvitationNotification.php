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
        $acceptUrl = route('invitations.accept', ['token' => $this->invitation->token]);

        $mail = (new MailMessage)
            ->subject('Invitation to join ' . $company->name . ' on HR Path-Finder')
            ->greeting('Hello!')
            ->line($inviter->name . ' has invited you to join **' . $company->name . '** as ' . ucfirst($this->invitation->role) . ' on HR Path-Finder.')
            ->line('You will be able to:')
            ->line('• Review and modify company information')
            ->line('• Complete the Management Philosophy Survey')
            ->line('• Collaborate on the HR project with the HR Manager')
            ->action('Accept Invitation', $acceptUrl)
            ->line('This invitation will expire in 7 days.')
            ->line('If you did not expect this invitation, you can safely ignore this email.');

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
