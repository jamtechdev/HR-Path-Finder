<?php

namespace App\Notifications;

use App\Models\HrProject;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrgKpiApprovalCompletedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public HrProject $hrProject,
        public string $organizationName
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("<Org KPI Approval Completed by CEO> {$this->organizationName} - {$this->hrProject->company->name}")
            ->view('emails.kpi-workflow-notification', [
                'companyLogo' => $this->hrProject->company->logo_path ?? null,
                'companyName' => $this->hrProject->company->name,
                'organizationName' => $this->organizationName,
                'recipientName' => $notifiable->name ?? 'Leader',
                'emailSubject' => "<Org KPI Approval Completed by CEO> {$this->organizationName} - {$this->hrProject->company->name}",
                'messageLine1' => "CEO has approved KPI for organization: <strong>{$this->organizationName}</strong>.",
                'messageLine2' => 'No further action is required from your side.',
                'footerNote' => 'Thank you for your contribution in KPI review.',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'hr_project_id' => $this->hrProject->id,
            'organization_name' => $this->organizationName,
        ];
    }
}

