<?php

namespace App\Enums;

enum StepStatus: string
{
    case NOT_STARTED = 'not_started';
    case IN_PROGRESS = 'in_progress';
    case SUBMITTED = 'submitted';
    case APPROVED = 'approved';
    case LOCKED = 'locked';

    public function label(): string
    {
        return match ($this) {
            self::NOT_STARTED => 'Not Started',
            self::IN_PROGRESS => 'In Progress',
            self::SUBMITTED => 'Submitted',
            self::APPROVED => 'Approved',
            self::LOCKED => 'Locked',
        };
    }

    public function canEdit(): bool
    {
        return in_array($this, [self::NOT_STARTED, self::IN_PROGRESS]);
    }

    public function isLocked(): bool
    {
        return $this === self::LOCKED;
    }
}
