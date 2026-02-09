<?php

namespace App\Enums;

enum CompanyRole: string
{
    case HR_MANAGER = 'hr_manager';
    case CEO = 'ceo';
    case CONSULTANT = 'consultant';

    public function label(): string
    {
        return match ($this) {
            self::HR_MANAGER => 'HR Manager',
            self::CEO => 'CEO',
            self::CONSULTANT => 'Consultant',
        };
    }
}
