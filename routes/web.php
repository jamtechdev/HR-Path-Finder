<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Companies
    Route::resource('companies', \App\Http\Controllers\CompanyController::class);
    
    // HR Projects
    Route::resource('hr-projects', \App\Http\Controllers\HrProjectController::class);
    
    // Diagnosis
    Route::get('hr-projects/{hrProject}/diagnosis/company-attributes', [\App\Http\Controllers\DiagnosisController::class, 'show'])->name('hr-projects.diagnosis.show');
    Route::post('hr-projects/{hrProject}/diagnosis/company-attributes', [\App\Http\Controllers\DiagnosisController::class, 'storeCompanyAttributes'])->name('hr-projects.diagnosis.store-attributes');
    Route::post('hr-projects/{hrProject}/diagnosis/organizational-sentiment', [\App\Http\Controllers\DiagnosisController::class, 'storeOrganizationalSentiment'])->name('hr-projects.diagnosis.store-sentiment');
    
    // CEO Philosophy
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
