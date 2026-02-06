<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public invitation routes (no auth required)
Route::get('invitations/accept/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'accept'])
    ->name('invitations.accept');
Route::post('invitations/accept/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'processAccept'])
    ->name('invitations.process-accept');
Route::get('invitations/reject/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'showReject'])
    ->name('invitations.reject');
Route::post('invitations/reject/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'reject'])
    ->name('invitations.reject.post');

// Manual email verification (only when SMTP not configured, development only)
Route::post('email/verify-manual', [\App\Http\Controllers\EmailVerificationController::class, 'manualVerify'])
    ->middleware('auth')
    ->name('verification.manual');

// OTP-based Password Reset Routes (override Fortify's default)
Route::get('forgot-password', [\App\Http\Controllers\PasswordResetController::class, 'showForgotPassword'])
    ->middleware('guest')
    ->name('password.request');
Route::post('forgot-password', [\App\Http\Controllers\PasswordResetController::class, 'sendOtp'])
    ->middleware('guest')
    ->name('password.email');
Route::get('verify-otp', [\App\Http\Controllers\PasswordResetController::class, 'showVerifyOtp'])
    ->middleware('guest')
    ->name('password.verify-otp');
Route::post('verify-otp', [\App\Http\Controllers\PasswordResetController::class, 'verifyOtp'])
    ->middleware('guest')
    ->name('password.verify-otp.post');
Route::post('resend-otp', [\App\Http\Controllers\PasswordResetController::class, 'resendOtp'])
    ->middleware('guest')
    ->name('password.resend-otp');
Route::get('reset-password', [\App\Http\Controllers\PasswordResetController::class, 'showResetPassword'])
    ->middleware('guest')
    ->name('password.reset');
Route::post('reset-password', [\App\Http\Controllers\PasswordResetController::class, 'resetPassword'])
    ->middleware('guest')
    ->name('password.update');

Route::middleware(['auth', 'verified'])->group(function () {
    // Main dashboard with role-based redirect
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard')->middleware('role.dashboard');
    
    // ========== CEO Routes ==========
    Route::middleware('role:ceo')->prefix('ceo')->name('ceo.')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'index'])
            ->name('dashboard');
        Route::get('dashboard/approvals', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'approvals'])
            ->name('dashboard.approvals');
        Route::get('philosophy-survey', [\App\Http\Controllers\CeoPhilosophyController::class, 'index'])
            ->name('philosophy-survey');
        
        // CEO Philosophy Survey (moved from hr-projects)
        Route::get('hr-projects/{hrProject}/ceo-philosophy', [\App\Http\Controllers\CeoPhilosophyController::class, 'show'])
            ->name('hr-projects.ceo-philosophy.show');
        Route::put('hr-projects/{hrProject}/ceo-philosophy', [\App\Http\Controllers\CeoPhilosophyController::class, 'update'])
            ->name('hr-projects.ceo-philosophy.update');
        Route::post('hr-projects/{hrProject}/ceo-philosophy/submit', [\App\Http\Controllers\CeoPhilosophyController::class, 'submit'])
            ->name('hr-projects.ceo-philosophy.submit');
    });
    
    // ========== HR Manager Routes ==========
    Route::middleware('role:hr_manager')->prefix('hr-manager')->name('hr-manager.')->group(function () {
        // Dashboard
        Route::get('dashboard', [\App\Http\Controllers\Dashboard\HrManagerDashboardController::class, 'index'])
            ->name('dashboard');
        Route::get('dashboard/projects', [\App\Http\Controllers\Dashboard\HrManagerDashboardController::class, 'projects'])
            ->name('dashboard.projects');
        
        // Companies
        Route::resource('companies', \App\Http\Controllers\CompanyController::class);
        Route::post('companies/{company}/invitations', [\App\Http\Controllers\CompanyInvitationController::class, 'store'])
            ->name('companies.invitations.store');
        Route::delete('companies/{company}/invitations/{invitation}', [\App\Http\Controllers\CompanyInvitationController::class, 'destroy'])
            ->name('companies.invitations.destroy');
        
        // CEOs Management
        Route::get('ceos', [\App\Http\Controllers\CeoController::class, 'index'])->name('ceos.index');
        Route::get('ceos/create', [\App\Http\Controllers\CeoController::class, 'create'])->name('ceos.create');
        Route::post('ceos', [\App\Http\Controllers\CeoController::class, 'store'])->name('ceos.store');
        Route::get('ceos/{ceo}/edit', [\App\Http\Controllers\CeoController::class, 'edit'])->name('ceos.edit');
        Route::put('ceos/{ceo}', [\App\Http\Controllers\CeoController::class, 'update'])->name('ceos.update');
        Route::delete('ceos/{ceo}/companies/{company}', [\App\Http\Controllers\CeoController::class, 'destroy'])->name('ceos.destroy');
        Route::post('ceos/{ceo}/companies/{company}/invite', [\App\Http\Controllers\CeoController::class, 'sendInvitation'])->name('ceos.send-invitation');
        Route::post('invitations/{invitation}/resend', [\App\Http\Controllers\CeoController::class, 'resendInvitation'])->name('invitations.resend');
        
        // HR System Output
        Route::get('hr-system-output', [\App\Http\Controllers\HrSystemOutputController::class, 'index'])->name('hr-system-output');
        
        // Diagnosis Start - Redirect to company-info tab (no company creation)
        Route::post('diagnosis/start', [\App\Http\Controllers\DiagnosisWizardController::class, 'start'])
            ->name('diagnosis.start');
        
        // Diagnosis Continue - Create/update project and redirect to first step
        Route::post('diagnosis/{projectId}/continue', [\App\Http\Controllers\DiagnosisWizardController::class, 'continue'])
            ->name('diagnosis.continue');
        
        // Diagnosis Steps - POST routes for HR Manager Tasks
        Route::post('diagnosis/{company}/company-info', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateCompanyInfo'])
            ->name('diagnosis.company-info.update');
        Route::post('diagnosis/{company}/business-profile', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateBusinessProfile'])
            ->name('diagnosis.business-profile.update');
        Route::post('diagnosis/{company}/workforce', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateWorkforce'])
            ->name('diagnosis.workforce.update');
        Route::post('diagnosis/{company}/executives', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateExecutives'])
            ->name('diagnosis.executives.update');
        Route::post('diagnosis/{company}/job-grades', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateJobGrades'])
            ->name('diagnosis.job-grades.update');
        Route::post('diagnosis/{company}/organizational-charts', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateOrganizationalCharts'])
            ->name('diagnosis.organizational-charts.update');
        Route::post('diagnosis/{company}/organizational-structure', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateOrganizationalStructure'])
            ->name('diagnosis.organizational-structure.update');
        Route::post('diagnosis/{company}/hr-issues', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateHrIssues'])
            ->name('diagnosis.hr-issues.update');
        Route::post('diagnosis/{company}/current-hr', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateCurrentHr'])
            ->name('diagnosis.current-hr.update');
        Route::post('diagnosis/{company}/culture', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateCulture'])
            ->name('diagnosis.culture.update');
        Route::post('diagnosis/{company}/confidential', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateConfidential'])
            ->name('diagnosis.confidential.update');
        
        // Diagnosis Submit - Save all data at once (creates company if doesn't exist)
        Route::post('diagnosis/submit', [\App\Http\Controllers\DiagnosisWizardController::class, 'submit'])
            ->name('diagnosis.submit');
        
        // Diagnosis Submit - Mark diagnosis as completed (all data already saved)
        Route::post('diagnosis/{company}/submit-diagnosis', [\App\Http\Controllers\DiagnosisWizardController::class, 'submitDiagnosis'])
            ->name('diagnosis.submit-diagnosis');
    });
    
    // ========== Shared Diagnosis Routes (HR Manager and CEO) ==========
    // Diagnosis workspace is accessible to both HR Manager and CEO
    Route::middleware('role:hr_manager,ceo')->prefix('hr-manager')->name('hr-manager.')->group(function () {
        // Diagnosis - Path-based routing for tabs (supports both /hr-manager/diagnosis/{tab} and /hr-manager/diagnosis/{projectId}/{tab})
        // IMPORTANT: Put the simpler route first to avoid matching conflicts
        Route::get('diagnosis/{tab}', [\App\Http\Controllers\DiagnosisWizardController::class, 'show'])
            ->where('tab', 'overview|company|company-info|business|business-profile|workforce|executives|job-grades|organizational-charts|organizational-structure|hr-issues|current-hr|culture|confidential|review')
            ->name('diagnosis.tab');
        Route::get('diagnosis/{projectId}/{tab}', [\App\Http\Controllers\DiagnosisWizardController::class, 'show'])
            ->where('projectId', '[0-9]+')
            ->where('tab', 'overview|company-info|business-profile|workforce|executives|job-grades|organizational-charts|organizational-structure|hr-issues|current-hr|culture|confidential|review')
            ->name('diagnosis.tab.with-project');
        Route::get('diagnosis', function () {
            return redirect()->route('hr-manager.diagnosis.tab', ['tab' => 'overview']);
        })->name('diagnosis.index');
    });
    
    // ========== Consultant/Admin Routes ==========
    Route::middleware('role:consultant,admin')->prefix('consultant')->name('consultant.')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Dashboard\ConsultantDashboardController::class, 'index'])
            ->name('dashboard');
        Route::get('dashboard/reviews', [\App\Http\Controllers\Dashboard\ConsultantDashboardController::class, 'reviews'])
            ->name('dashboard.reviews');
    });
    
    // ========== Shared Routes (HR Projects, etc.) ==========
    Route::resource('hr-projects', \App\Http\Controllers\HrProjectController::class);
    
    // Note: CEO Philosophy routes are now under /ceo/hr-projects/{hrProject}/ceo-philosophy
    
    // Organization Design
    Route::get('hr-projects/{hrProject}/organization-design', [\App\Http\Controllers\OrganizationDesignController::class, 'show'])->name('hr-projects.organization-design.show');
    Route::put('hr-projects/{hrProject}/organization-design', [\App\Http\Controllers\OrganizationDesignController::class, 'update'])->name('hr-projects.organization-design.update');
    Route::post('hr-projects/{hrProject}/organization-design/submit', [\App\Http\Controllers\OrganizationDesignController::class, 'submit'])->name('hr-projects.organization-design.submit');
    
    // Performance System
    Route::get('hr-projects/{hrProject}/performance-system', [\App\Http\Controllers\PerformanceSystemController::class, 'show'])->name('hr-projects.performance-system.show');
    Route::put('hr-projects/{hrProject}/performance-system', [\App\Http\Controllers\PerformanceSystemController::class, 'update'])->name('hr-projects.performance-system.update');
    Route::post('hr-projects/{hrProject}/performance-system/submit', [\App\Http\Controllers\PerformanceSystemController::class, 'submit'])->name('hr-projects.performance-system.submit');
    
    // Compensation System
    Route::get('hr-projects/{hrProject}/compensation-system', [\App\Http\Controllers\CompensationSystemController::class, 'show'])->name('hr-projects.compensation-system.show');
    Route::put('hr-projects/{hrProject}/compensation-system', [\App\Http\Controllers\CompensationSystemController::class, 'update'])->name('hr-projects.compensation-system.update');
    Route::post('hr-projects/{hrProject}/compensation-system/submit', [\App\Http\Controllers\CompensationSystemController::class, 'submit'])->name('hr-projects.compensation-system.submit');
    
    // Consultant Review
    Route::get('hr-projects/{hrProject}/consultant-review', [\App\Http\Controllers\ConsultantReviewController::class, 'show'])->name('hr-projects.consultant-review.show');
    Route::post('hr-projects/{hrProject}/consultant-review', [\App\Http\Controllers\ConsultantReviewController::class, 'store'])->name('hr-projects.consultant-review.store');
    
    // CEO Approval
    Route::get('hr-projects/{hrProject}/ceo-approval', [\App\Http\Controllers\CeoApprovalController::class, 'show'])->name('hr-projects.ceo-approval.show');
    Route::post('hr-projects/{hrProject}/ceo-approval/approve', [\App\Http\Controllers\CeoApprovalController::class, 'approve'])->name('hr-projects.ceo-approval.approve');
    Route::post('hr-projects/{hrProject}/ceo-approval/request-changes', [\App\Http\Controllers\CeoApprovalController::class, 'requestChanges'])->name('hr-projects.ceo-approval.request-changes');
    
    // HR System Dashboard
    Route::get('hr-projects/{hrProject}/dashboard', [\App\Http\Controllers\HrSystemDashboardController::class, 'show'])->name('hr-projects.dashboard.show');
    
    // HR System Overview (accessible to HR Manager and CEO)
    Route::get('hr-projects/{hrProject}/overview', [\App\Http\Controllers\HrSystemOverviewController::class, 'show'])->name('hr-projects.overview');
    
    // Step Verification (CEO only)
    Route::post('hr-projects/{hrProject}/verify/{step}', [\App\Http\Controllers\StepVerificationController::class, 'verify'])
        ->name('hr-projects.verify')
        ->middleware('role:ceo');
    
    // Diagnosis (legacy routes for hr-projects)
    Route::get('hr-projects/{hrProject}/diagnosis/company-attributes', [\App\Http\Controllers\DiagnosisController::class, 'show'])->name('hr-projects.diagnosis.show');
    Route::post('hr-projects/{hrProject}/diagnosis/company-attributes', [\App\Http\Controllers\DiagnosisController::class, 'storeCompanyAttributes'])->name('hr-projects.diagnosis.store-attributes');
    Route::post('hr-projects/{hrProject}/diagnosis/organizational-sentiment', [\App\Http\Controllers\DiagnosisController::class, 'storeOrganizationalSentiment'])->name('hr-projects.diagnosis.store-sentiment');
});

require __DIR__.'/settings.php';
