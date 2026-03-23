<?php

namespace App\Notifications;

use App\Models\HrProject;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrgKpiRevisionRequestedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public HrProject $hrProject,
        public string $organizationName,
        public string $revisionComment,
        public string $reviewUrl
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("<Org KPI Revision Requested by CEO> {$this->organizationName} - {$this->hrProject->company->name}")
            ->view('emails.kpi-workflow-notification', [
                'companyLogo' => $this->hrProject->company->logo_path ?? null,
                'companyName' => $this->hrProject->company->name,
                'organizationName' => $this->organizationName,
                'recipientName' => $notifiable->name ?? 'Leader',
                'emailSubject' => "<Org KPI Revision Requested by CEO> {$this->organizationName} - {$this->hrProject->company->name}",
                'messageLine1' => "CEO requested revisions for <strong>{$this->organizationName}</strong>.",
                'messageLine2' => "Revision comment: <strong>{$this->revisionComment}</strong>",
                'actionUrl' => $this->reviewUrl,
                'actionText' => 'Review KPIs',
                'footerNote' => 'Please update KPI draft and submit again.',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'hr_project_id' => $this->hrProject->id,
            'organization_name' => $this->organizationName,
            'revision_comment' => $this->revisionComment,
            'review_url' => $this->reviewUrl,
        ];
    }
}

