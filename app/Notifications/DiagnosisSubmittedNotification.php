<?php

namespace App\Notifications;

use App\Models\HrProject;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DiagnosisSubmittedNotification extends Notification implements ShouldQueue
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
            ->subject('Diagnosis Submitted for ' . $company->name)
            ->greeting('Hello!')
            ->line('The HR Manager has submitted the diagnosis for **' . $company->name . '**.')
            ->line('**What you need to do:**')
            ->line('• Review the diagnosis data')
            ->line('• Edit any fields if necessary')
            ->line('• Complete the Management Philosophy Survey')
            ->line('• Confirm and approve the diagnosis')
            ->action('Review Diagnosis', route('ceo.review.diagnosis', $this->hrProject))
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
