<?php

namespace App\Notifications;

use App\Models\HrProject;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CeoDiagnosisConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public HrProject $hrProject
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
        $company = $this->hrProject->company;

        return (new MailMessage)
            ->subject('CEO Diagnosis Complete – Next Step Open for ' . $company->name)
            ->greeting('Hello,')
            ->line('The CEO has successfully completed the Diagnosis.')
            ->line('The next step is now open for you. Please proceed with the **System Draft Design** based on the CEO\'s responses. Ensuring a seamless transition to the next phase is key to a successful project.')
            ->action('Go to Dashboard', route('hr-manager.dashboard'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'hr_project_id' => $this->hrProject->id,
            'company_name' => $this->hrProject->company->name,
        ];
    }
}
