<?php

namespace App\Mail;

use App\Models\CompanyInvitation;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class CompanyInvitationMail extends Mailable
{
    public string $emailSubject;
    public string $emailView;
    public array $emailData;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public CompanyInvitation $invitation,
        string $emailSubject,
        string $emailView,
        array $emailData = [],
    ) {
        $this->emailSubject = $emailSubject;
        $this->emailView = $emailView;
        $this->emailData = $emailData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->emailSubject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: $this->emailView,
            with: $this->emailData,
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
