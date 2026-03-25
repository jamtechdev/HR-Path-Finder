<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactUsSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'manager_name',
        'manager_email',
        'phone',
        'inquiry',
        'agreed_personal_information',
    ];
}

