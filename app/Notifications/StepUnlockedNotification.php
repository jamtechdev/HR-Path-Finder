<?php

namespace App\Notifications;

use App\Models\HrProject;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StepUnlockedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public HrProject $hrProject,
        public string $stepName,
        public string $previousStepName
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
        $stepNames = [
            'diagnosis' => 'Diagnosis – Step 1',
            'organization' => 'Organization Design – Step 2',
            'performance' => 'Performance System – Step 3',
            'compensation' => 'Compensation System – Step 4',
        ];

        $stepDisplayName = $stepNames[$this->stepName] ?? $this->stepName;
        $previousStepDisplayName = $stepNames[$this->previousStepName] ?? $this->previousStepName;

        return (new MailMessage)
            ->subject("{$previousStepDisplayName} Verified – {$stepDisplayName} Unlocked")
            ->line("Great news! The CEO has verified {$previousStepDisplayName} for {$this->hrProject->company->name}.")
            ->line("You can now proceed with {$stepDisplayName}.")
            ->action('View Dashboard', route('dashboard.hr-manager'))
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
            'step_name' => $this->stepName,
            'previous_step_name' => $this->previousStepName,
            'company_name' => $this->hrProject->company->name,
        ];
    }
}
