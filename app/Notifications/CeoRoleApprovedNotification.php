<?php

namespace App\Notifications;

use App\Models\CeoRoleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CeoRoleApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public CeoRoleRequest $ceoRoleRequest
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
        $company = $this->ceoRoleRequest->company;
        $loginUrl = route('login');
        
        \Log::info('CeoRoleApprovedNotification::toMail called', [
            'request_id' => $this->ceoRoleRequest->id,
            'user_id' => $notifiable->id,
            'email' => $notifiable->email,
            'company_id' => $company->id,
            'company_name' => $company->name,
        ]);

        return (new MailMessage)
            ->subject('🎉 Welcome! You are now a CEO for ' . $company->name)
            ->greeting('Congratulations!')
            ->line('Your request to become CEO for **' . $company->name . '** has been **approved** by the administrator.')
            ->line('**You are now a CEO!**')
            ->line('**What this means:**')
            ->line('✅ You now have CEO role for **' . $company->name . '**')
            ->line('✅ You can access the CEO dashboard')
            ->line('✅ You can review and approve HR strategy steps')
            ->line('✅ You can complete the Management Philosophy Survey')
            ->line('✅ You can collaborate with HR Manager on projects')
            ->line('**Next Steps:**')
            ->line('1. Login to your account using your existing credentials')
            ->line('2. You will be redirected to the CEO dashboard')
            ->line('3. Complete the Management Philosophy Survey if there\'s an active project')
            ->line('4. Start reviewing and managing HR projects')
            ->action('🔑 Login to CEO Dashboard', $loginUrl)
            ->line('If you have any questions, please contact the administrator.')
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
            'request_id' => $this->ceoRoleRequest->id,
            'company_id' => $this->ceoRoleRequest->company_id,
            'company_name' => $this->ceoRoleRequest->company->name,
        ];
    }
}
