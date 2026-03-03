<?php

namespace App\Mail;

use App\Models\HrProject;
use App\Models\OrganizationalKpi;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class KpiCreatedNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public HrProject $hrProject;
    public array $kpis;
    public string $companyName;
    public string $reviewUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(HrProject $hrProject, array $kpis, string $userRole = 'ceo')
    {
        $this->hrProject = $hrProject;
        $this->kpis = $kpis;
        $this->companyName = $hrProject->company->name ?? 'the company';
        
        // Link to dashboard based on user role
        if ($userRole === 'admin') {
            $this->reviewUrl = route('admin.dashboard');
        } else {
            $this->reviewUrl = route('ceo.dashboard');
        }
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New KPIs Created - {$this->companyName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.kpi-created-notification',
            with: [
                'hrProject' => $this->hrProject,
                'kpis' => $this->kpis,
                'companyName' => $this->companyName,
                'reviewUrl' => $this->reviewUrl,
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
