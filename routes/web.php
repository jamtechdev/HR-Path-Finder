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

Route::middleware(['auth', 'verified'])->group(function () {
    // Main dashboard with role-based redirect
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard')->middleware('role.dashboard');
    
    // Role-specific dashboards
    Route::get('dashboard/ceo', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'index'])
        ->name('dashboard.ceo')
        ->middleware('role:ceo');
    
    Route::get('dashboard/ceo/approvals', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'approvals'])
        ->name('dashboard.ceo.approvals')
        ->middleware('role:ceo');
    
    Route::get('dashboard/hr-manager', [\App\Http\Controllers\Dashboard\HrManagerDashboardController::class, 'index'])
        ->name('dashboard.hr-manager')
        ->middleware('role:hr_manager');
    
    Route::get('dashboard/hr-manager/projects', [\App\Http\Controllers\Dashboard\HrManagerDashboardController::class, 'projects'])
        ->name('dashboard.hr-manager.projects')
        ->middleware('role:hr_manager');
    
    Route::get('dashboard/consultant', [\App\Http\Controllers\Dashboard\ConsultantDashboardController::class, 'index'])
        ->name('dashboard.consultant')
        ->middleware('role:consultant');
    
    Route::get('dashboard/consultant/reviews', [\App\Http\Controllers\Dashboard\ConsultantDashboardController::class, 'reviews'])
        ->name('dashboard.consultant.reviews')
        ->middleware('role:consultant');

    // Companies
    Route::resource('companies', \App\Http\Controllers\CompanyController::class);
    
    // Company Invitations (nested under companies)
    Route::post('companies/{company}/invitations', [\App\Http\Controllers\CompanyInvitationController::class, 'store'])
        ->name('companies.invitations.store');
    Route::delete('companies/{company}/invitations/{invitation}', [\App\Http\Controllers\CompanyInvitationController::class, 'destroy'])
        ->name('companies.invitations.destroy');
    
    // CEOs Management (HR Manager only)
    Route::middleware('role:hr_manager')->group(function () {
        Route::get('ceos', [\App\Http\Controllers\CeoController::class, 'index'])->name('ceos.index');
        Route::get('ceos/create', [\App\Http\Controllers\CeoController::class, 'create'])->name('ceos.create');
        Route::post('ceos', [\App\Http\Controllers\CeoController::class, 'store'])->name('ceos.store');
        Route::get('ceos/{ceo}/edit', [\App\Http\Controllers\CeoController::class, 'edit'])->name('ceos.edit');
        Route::put('ceos/{ceo}', [\App\Http\Controllers\CeoController::class, 'update'])->name('ceos.update');
        Route::delete('ceos/{ceo}/companies/{company}', [\App\Http\Controllers\CeoController::class, 'destroy'])->name('ceos.destroy');
        Route::post('ceos/{ceo}/companies/{company}/invite', [\App\Http\Controllers\CeoController::class, 'sendInvitation'])->name('ceos.send-invitation');
    });
    
    // HR Projects
    Route::resource('hr-projects', \App\Http\Controllers\HrProjectController::class);
    
    // Diagnosis
    Route::get('diagnosis', [\App\Http\Controllers\DiagnosisWizardController::class, 'show'])
        ->name('diagnosis.index');
    Route::post('diagnosis/{hrProject}/company-info', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateCompanyInfo'])
        ->name('diagnosis.company-info.update');
    Route::post('diagnosis/{hrProject}/business-profile', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateBusinessProfile'])
        ->name('diagnosis.business-profile.update');
    Route::post('diagnosis/{hrProject}/workforce', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateWorkforce'])
        ->name('diagnosis.workforce.update');
    Route::post('diagnosis/{hrProject}/current-hr', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateCurrentHr'])
        ->name('diagnosis.current-hr.update');
    Route::post('diagnosis/{hrProject}/culture', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateCulture'])
        ->name('diagnosis.culture.update');
    Route::post('diagnosis/{hrProject}/confidential', [\App\Http\Controllers\DiagnosisWizardController::class, 'updateConfidential'])
        ->name('diagnosis.confidential.update');
    Route::post('diagnosis/{hrProject}/submit', [\App\Http\Controllers\DiagnosisWizardController::class, 'submit'])
        ->name('diagnosis.submit');
    
    Route::get('hr-projects/{hrProject}/diagnosis/company-attributes', [\App\Http\Controllers\DiagnosisController::class, 'show'])->name('hr-projects.diagnosis.show');
    Route::post('hr-projects/{hrProject}/diagnosis/company-attributes', [\App\Http\Controllers\DiagnosisController::class, 'storeCompanyAttributes'])->name('hr-projects.diagnosis.store-attributes');
    Route::post('hr-projects/{hrProject}/diagnosis/organizational-sentiment', [\App\Http\Controllers\DiagnosisController::class, 'storeOrganizationalSentiment'])->name('hr-projects.diagnosis.store-sentiment');
    
    // CEO Philosophy
    Route::get('ceo/philosophy-survey', [\App\Http\Controllers\CeoPhilosophyController::class, 'index'])->name('ceo.philosophy-survey')->middleware('role:ceo');
    Route::get('hr-projects/{hrProject}/ceo-philosophy', [\App\Http\Controllers\CeoPhilosophyController::class, 'show'])->name('hr-projects.ceo-philosophy.show');
    Route::put('hr-projects/{hrProject}/ceo-philosophy', [\App\Http\Controllers\CeoPhilosophyController::class, 'update'])->name('hr-projects.ceo-philosophy.update');
    Route::post('hr-projects/{hrProject}/ceo-philosophy/submit', [\App\Http\Controllers\CeoPhilosophyController::class, 'submit'])->name('hr-projects.ceo-philosophy.submit');
    
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
});

require __DIR__.'/settings.php';
