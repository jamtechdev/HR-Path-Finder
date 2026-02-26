<?php

namespace App\Notifications;

use App\Models\KpiReviewToken;
use App\Models\HrProject;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class KpiReviewRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public KpiReviewToken $reviewToken,
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
        $reviewUrl = route('kpi-review.token', ['token' => $this->reviewToken->token]);
        $companyName = $this->hrProject->company->name ?? 'the company';
        $organizationName = $this->reviewToken->organization_name;

        return (new MailMessage)
            ->subject("KPI Review Request - {$organizationName} - {$companyName}")
            ->greeting("Hello {$this->reviewToken->name},")
            ->line("You have been requested to review the Key Performance Indicators (KPIs) for **{$organizationName}** in {$companyName}.")
            ->line("Please review the proposed KPIs and provide your feedback.")
            ->action('Review KPIs', $reviewUrl)
            ->line("This review link will expire on " . $this->reviewToken->expires_at->format('F d, Y') . ".")
            ->line("You can submit your review up to 3 times using this link.")
            ->line('If you did not expect this request, please ignore this email.')
            ->salutation('Best regards, HR Path-Finder Team');
    }
}
