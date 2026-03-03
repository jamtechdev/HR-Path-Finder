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
            subject: "KPI Review Request - {$this->organizationName} - {$this->companyName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.kpi-review-request',
            with: [
                'reviewToken' => $this->reviewToken,
                'hrProject' => $this->hrProject,
                'reviewUrl' => $this->reviewUrl,
                'companyName' => $this->companyName,
                'organizationName' => $this->organizationName,
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
