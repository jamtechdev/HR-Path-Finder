<?php

namespace App\Notifications;

use App\Models\HrProject;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CeoKpiReviewRequestedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public HrProject $hrProject,
        public string $organizationName
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("<KPI Review Request from Manager> {$this->organizationName} - {$this->hrProject->company->name}")
            ->view('emails.kpi-workflow-notification', [
                'companyLogo' => $this->hrProject->company->logo_path ?? null,
                'companyName' => $this->hrProject->company->name,
                'organizationName' => $this->organizationName,
                'recipientName' => $notifiable->name ?? 'CEO',
                'emailSubject' => "<KPI Review Request from Manager> {$this->organizationName} - {$this->hrProject->company->name}",
                'messageLine1' => "HR Manager requested CEO KPI review for organization: <strong>{$this->organizationName}</strong>.",
                'messageLine2' => 'Please review and finalize these KPIs.',
                'actionUrl' => route('ceo.kpi-review.index', $this->hrProject),
                'actionText' => 'Open CEO KPI Review',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'hr_project_id' => $this->hrProject->id,
            'organization_name' => $this->organizationName,
            'company_name' => $this->hrProject->company->name,
        ];
    }
}

