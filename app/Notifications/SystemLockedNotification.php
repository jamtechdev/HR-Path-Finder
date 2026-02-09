<?php

namespace App\Notifications;

use App\Models\HrProject;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SystemLockedNotification extends Notification implements ShouldQueue
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
            ->subject('HR System Locked for ' . $company->name)
            ->greeting('Congratulations!')
            ->line('The HR System for **' . $company->name . '** has been approved and locked by the CEO.')
            ->line('**Your HR System is now complete and immutable.**')
            ->line('**What you can do:**')
            ->line('• View the complete HR System overview')
            ->line('• Use this as a baseline for future iterations')
            ->line('• All steps are now read-only')
            ->action('View HR System Overview', route('hr-system.overview', $this->hrProject))
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
