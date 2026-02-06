<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetOtpNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $otp,
        public int $expiresIn = 10
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
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
        return (new MailMessage)
            ->subject('🔐 Password Reset OTP - HR Path-Finder')
            ->greeting('Hello!')
            ->line('You have requested to reset your password for your HR Path-Finder account.')
            ->line('**Your OTP Code:**')
            ->line('## ' . $this->otp)
            ->line('**Important:**')
            ->line('• This OTP is valid for ' . $this->expiresIn . ' minutes only')
            ->line('• Do not share this OTP with anyone')
            ->line('• If you did not request this, please ignore this email')
            ->line('• For security, this OTP can only be used once')
            ->salutation('Best regards,<br>The HR Path-Finder Team');
    }
}
