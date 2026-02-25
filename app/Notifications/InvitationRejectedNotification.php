<?php

namespace App\Notifications;

use App\Models\CompanyInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvitationRejectedNotification extends Notification implements ShouldQueue
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
        \Log::info('InvitationRejectedNotification::toMail called', [
            'invitation_id' => $this->invitation->id,
            'hr_manager_email' => $notifiable->email,
            'ceo_email' => $this->invitation->email,
            'company_id' => $this->invitation->company_id,
            'mailer' => config('mail.default'),
            'mail_host' => config('mail.mailers.smtp.host'),
            'timestamp' => now()->toIso8601String(),
        ]);

        $company = $this->invitation->company;
        $inviter = $this->invitation->inviter;
        
        return (new MailMessage)
            ->subject('❌ CEO Invitation Rejected - ' . $company->name)
            ->greeting('Hello ' . $inviter->name . ',')
            ->line('We wanted to inform you that the CEO invitation you sent has been **rejected**.')
            ->line('**Invitation Details:**')
            ->line('• **Company:** ' . $company->name)
            ->line('• **Invited Email:** ' . $this->invitation->email)
            ->line('• **Role:** CEO')
            ->line('• **Invited On:** ' . $this->invitation->created_at->format('F j, Y \a\t g:i A'))
            ->line('**What to do next:**')
            ->line('• You may want to reach out to the invited person directly to understand their decision')
            ->line('• You can invite a different person to fill the CEO role')
            ->line('• If this was sent by mistake, no further action is needed')
            ->action('View Company Details', route('companies.show', $company->id))
            ->line('If you have any questions or need assistance, please contact our support team.')
            ->salutation('Best regards,<br>The HR Path-Finder Team');
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
            'email' => $this->invitation->email,
        ];
    }
}
