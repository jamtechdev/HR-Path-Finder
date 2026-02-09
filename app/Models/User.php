<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'address',
        'city',
        'state',
        'latitude',
        'longitude',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }


    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailNotification);
    }

    /**
     * Get all companies associated with this user.
     */
    public function companies()
    {
        return $this->belongsToMany(Company::class, 'company_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get companies where user is HR Manager.
     */
    public function hrManagedCompanies()
    {
        return $this->companies()->wherePivot('role', 'hr_manager');
    }

    /**
     * Get companies where user is CEO.
     */
    public function ceoCompanies()
    {
        return $this->companies()->wherePivot('role', 'ceo');
    }

    /**
     * Get companies where user is Consultant.
     */
    public function consultantCompanies()
    {
        return $this->companies()->wherePivot('role', 'consultant');
    }

    /**
     * Get HR projects for companies this user is associated with.
     */
    public function hrProjects()
    {
        return HrProject::whereHas('company', function ($query) {
            $query->whereHas('users', function ($q) {
                $q->where('users.id', $this->id);
            });
        });
    }

    /**
     * Get CEO philosophies created by this user.
     */
    public function ceoPhilosophies()
    {
        return $this->hasMany(CeoPhilosophy::class);
    }

    /**
     * Get audit logs created by this user.
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get consultant comments created by this user.
     */
    public function adminComments()
    {
        return $this->hasMany(AdminComment::class);
    }

    /**
     * Get company invitations sent by this user.
     */
    public function sentInvitations()
    {
        return $this->hasMany(CompanyInvitation::class, 'inviter_id');
    }
}
