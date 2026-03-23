<?php

namespace App\Mail;

use App\Models\KpiReviewToken;
use App\Models\HrProject;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class KpiReviewRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public KpiReviewToken $reviewToken;
    public HrProject $hrProject;
    public string $reviewUrl;
    public string $companyName;
    public string $organizationName;

    /**
     * Create a new message instance.
     */
    public function __construct(KpiReviewToken $reviewToken, HrProject $hrProject)
    {
        $this->reviewToken = $reviewToken;
        $this->hrProject = $hrProject;
        $this->reviewUrl = route('kpi-review.token', ['token' => $reviewToken->token]);
        $this->companyName = $hrProject->company->name ?? 'the company';
        $this->organizationName = $reviewToken->organization_name;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "<KPI Review Request from Manager> {$this->organizationName} - {$this->companyName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.kpi-workflow-notification',
            with: [
                'companyLogo' => $this->hrProject->company->logo_path ?? null,
                'companyName' => $this->companyName,
                'organizationName' => $this->organizationName,
                'recipientName' => $this->reviewToken->name,
                'emailSubject' => "<KPI Review Request from Manager> {$this->organizationName} - {$this->companyName}",
                'messageLine1' => "You have been requested to review the Key Performance Indicators (KPIs) for <strong>{$this->organizationName}</strong> in {$this->companyName}.",
                'messageLine2' => 'Please review the proposed KPIs and provide your feedback.',
                'actionUrl' => $this->reviewUrl,
                'actionText' => 'Review KPIs',
                'details' => [
                    "This review link will expire on <strong>{$this->reviewToken->expires_at->format('F d, Y')}</strong>",
                    'You can submit your review up to <strong>3 times</strong> using this link',
                ],
                'footerNote' => 'If you did not expect this request, please ignore this email.',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
