<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Invitation routes - accept can be accessed without auth
Route::get('invitations/accept/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'accept'])
    ->name('invitations.accept');
Route::post('invitations/accept/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'processAccept'])
    ->name('invitations.accept.process');

Route::middleware(['auth', 'verified'])->group(function () {
    // Main dashboard with role-based redirect
    Route::get('dashboard', function () {
        $user = auth()->user();
        $role = $user->roles->first()?->name;
        
        return match ($role) {
            'ceo' => redirect()->route('dashboard.ceo'),
            'hr_manager' => redirect()->route('dashboard.hr-manager'),
            'consultant' => redirect()->route('dashboard.consultant'),
            default => redirect()->route('dashboard.hr-manager'), // Fallback
        };
    })->name('dashboard');
    
    // CEO routes - prefix: ceo, middleware: role:ceo
    Route::prefix('ceo')->middleware('role:ceo')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'index'])
            ->name('dashboard.ceo');
        
        Route::get('hr-projects/{hrProject}/view', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'viewHrProject'])
            ->name('ceo.hr-projects.view');
        
        Route::get('philosophy-survey', [\App\Http\Controllers\CeoPhilosophyController::class, 'index'])
            ->name('ceo.philosophy-survey');
    });
    
    // HR Manager routes - prefix: hr-manager, middleware: role:hr_manager
    Route::prefix('hr-manager')->middleware('role:hr_manager')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Dashboard\HrManagerDashboardController::class, 'index'])
            ->name('dashboard.hr-manager');
        
        Route::get('dashboard/projects', [\App\Http\Controllers\Dashboard\HrManagerDashboardController::class, 'projects'])
            ->name('dashboard.hr-manager.projects');
    });
    
    // Consultant routes - prefix: consultant, middleware: role:consultant
    Route::prefix('consultant')->middleware('role:consultant')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Dashboard\ConsultantDashboardController::class, 'index'])
            ->name('dashboard.consultant');
        
        Route::get('companies', function () {
            $companies = \App\Models\Company::with('hrProjects')->get();
            return Inertia::render('Consultant/Companies/Index', [
                'companies' => $companies,
            ]);
        })->name('consultant.companies');
        
        Route::get('dashboard/reviews', [\App\Http\Controllers\Dashboard\ConsultantDashboardController::class, 'reviews'])
            ->name('dashboard.consultant.reviews');
    });

    // Companies - explicitly define create route first to avoid conflicts with diagnosis routes
    Route::get('companies/create', [\App\Http\Controllers\CompanyController::class, 'create'])
        ->name('companies.create');
    Route::resource('companies', \App\Http\Controllers\CompanyController::class)->except(['create']);
    
    // Company Invitations
    Route::post('companies/{company}/invitations', [\App\Http\Controllers\CompanyInvitationController::class, 'store'])
        ->name('companies.invitations.store');
    Route::delete('companies/{company}/invitations/{invitation}', [\App\Http\Controllers\CompanyInvitationController::class, 'destroy'])
        ->name('companies.invitations.destroy');
    
    // HR Projects
    Route::resource('hr-projects', \App\Http\Controllers\HrProjectController::class);
    
    // Diagnosis - Overview (default route)
    Route::get('diagnosis', [\App\Http\Controllers\DiagnosisWizardController::class, 'overview'])
        ->name('diagnosis.index');
    
    // Continue from Overview - sets step to in_progress
    Route::post('diagnosis/{hrProject}/continue', [\App\Http\Controllers\DiagnosisWizardController::class, 'continueStep'])
        ->name('diagnosis.continue');
    
    // Diagnosis steps - GET routes for viewing each step
    // Note: These routes use {hrProject} model binding, so they must come after /companies/create
    Route::get('diagnosis/{hrProject}/company-info', [\App\Http\Controllers\DiagnosisWizardController::class, 'showCompanyInfo'])
        ->name('diagnosis.company-info');
    Route::get('diagnosis/{hrProject}/business-profile', [\App\Http\Controllers\DiagnosisWizardController::class, 'showBusinessProfile'])
        ->name('diagnosis.business-profile');
    Route::get('diagnosis/{hrProject}/workforce', [\App\Http\Controllers\DiagnosisWizardController::class, 'showWorkforce'])
        ->name('diagnosis.workforce');
    Route::get('diagnosis/{hrProject}/current-hr', [\App\Http\Controllers\DiagnosisWizardController::class, 'showCurrentHr'])
        ->name('diagnosis.current-hr');
    Route::get('diagnosis/{hrProject}/culture', [\App\Http\Controllers\DiagnosisWizardController::class, 'showCulture'])
        ->name('diagnosis.culture');
    Route::get('diagnosis/{hrProject}/confidential', [\App\Http\Controllers\DiagnosisWizardController::class, 'showConfidential'])
        ->name('diagnosis.confidential');
    Route::get('diagnosis/{hrProject}/review', [\App\Http\Controllers\DiagnosisWizardController::class, 'showReview'])
        ->name('diagnosis.review');
    
    // Diagnosis steps - POST routes for saving each step
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
    
    // Organization Design (Step 2) - Overview (default route)
    Route::get('step2', [\App\Http\Controllers\OrganizationWizardController::class, 'overview'])
        ->name('organization.index');
    
    // Organization Design steps - GET routes for viewing each step
    Route::get('step2/{hrProject}/organization-structure', [\App\Http\Controllers\OrganizationWizardController::class, 'showOrganizationStructure'])
        ->name('organization.organization-structure');
    Route::get('step2/{hrProject}/job-grade-structure', [\App\Http\Controllers\OrganizationWizardController::class, 'showJobGradeStructure'])
        ->name('organization.job-grade-structure');
    Route::get('step2/{hrProject}/grade-title-relationship', [\App\Http\Controllers\OrganizationWizardController::class, 'showGradeTitleRelationship'])
        ->name('organization.grade-title-relationship');
    Route::get('step2/{hrProject}/managerial-definition', [\App\Http\Controllers\OrganizationWizardController::class, 'showManagerialDefinition'])
        ->name('organization.managerial-definition');
    Route::get('step2/{hrProject}/review', [\App\Http\Controllers\OrganizationWizardController::class, 'showReview'])
        ->name('organization.review');
    
    // Organization Design steps - POST routes for saving each step
    Route::post('step2/{hrProject}/organization-structure', [\App\Http\Controllers\OrganizationWizardController::class, 'updateOrganizationStructure'])
        ->name('organization.organization-structure.update');
    Route::post('step2/{hrProject}/job-grade-structure', [\App\Http\Controllers\OrganizationWizardController::class, 'updateJobGradeStructure'])
        ->name('organization.job-grade-structure.update');
    Route::post('step2/{hrProject}/grade-title-relationship', [\App\Http\Controllers\OrganizationWizardController::class, 'updateGradeTitleRelationship'])
        ->name('organization.grade-title-relationship.update');
    Route::post('step2/{hrProject}/managerial-definition', [\App\Http\Controllers\OrganizationWizardController::class, 'updateManagerialDefinition'])
        ->name('organization.managerial-definition.update');
    Route::post('step2/{hrProject}/submit', [\App\Http\Controllers\OrganizationWizardController::class, 'submit'])
        ->name('organization.submit');
    
    // Performance System (Step 3) - Overview (default route)
    Route::get('step3', [\App\Http\Controllers\PerformanceWizardController::class, 'overview'])
        ->name('performance.index');
    
    // Performance System steps - GET routes
    Route::get('step3/{hrProject}/evaluation-unit', [\App\Http\Controllers\PerformanceWizardController::class, 'showEvaluationUnit'])
        ->name('performance.evaluation-unit');
    Route::get('step3/{hrProject}/performance-method', [\App\Http\Controllers\PerformanceWizardController::class, 'showPerformanceMethod'])
        ->name('performance.performance-method');
    Route::get('step3/{hrProject}/evaluation-structure', [\App\Http\Controllers\PerformanceWizardController::class, 'showEvaluationStructure'])
        ->name('performance.evaluation-structure');
    Route::get('step3/{hrProject}/review', [\App\Http\Controllers\PerformanceWizardController::class, 'showReview'])
        ->name('performance.review');
    
    // Performance System steps - POST routes
    Route::post('step3/{hrProject}/evaluation-unit', [\App\Http\Controllers\PerformanceWizardController::class, 'updateEvaluationUnit'])
        ->name('performance.evaluation-unit.update');
    Route::post('step3/{hrProject}/performance-method', [\App\Http\Controllers\PerformanceWizardController::class, 'updatePerformanceMethod'])
        ->name('performance.performance-method.update');
    Route::post('step3/{hrProject}/evaluation-structure', [\App\Http\Controllers\PerformanceWizardController::class, 'updateEvaluationStructure'])
        ->name('performance.evaluation-structure.update');
    Route::post('step3/{hrProject}/submit', [\App\Http\Controllers\PerformanceWizardController::class, 'submit'])
        ->name('performance.submit');
    
    // Compensation System (Step 4) - Overview (default route)
    Route::get('step4', [\App\Http\Controllers\CompensationWizardController::class, 'overview'])
        ->name('compensation.index');
    
    // Compensation System steps - GET routes
    Route::get('step4/{hrProject}/compensation-structure', [\App\Http\Controllers\CompensationWizardController::class, 'showCompensationStructure'])
        ->name('compensation.compensation-structure');
    Route::get('step4/{hrProject}/differentiation-method', [\App\Http\Controllers\CompensationWizardController::class, 'showDifferentiationMethod'])
        ->name('compensation.differentiation-method');
    Route::get('step4/{hrProject}/incentive-components', [\App\Http\Controllers\CompensationWizardController::class, 'showIncentiveComponents'])
        ->name('compensation.incentive-components');
    Route::get('step4/{hrProject}/review', [\App\Http\Controllers\CompensationWizardController::class, 'showReview'])
        ->name('compensation.review');
    
    // Compensation System steps - POST routes
    Route::post('step4/{hrProject}/compensation-structure', [\App\Http\Controllers\CompensationWizardController::class, 'updateCompensationStructure'])
        ->name('compensation.compensation-structure.update');
    Route::post('step4/{hrProject}/differentiation-method', [\App\Http\Controllers\CompensationWizardController::class, 'updateDifferentiationMethod'])
        ->name('compensation.differentiation-method.update');
    Route::post('step4/{hrProject}/incentive-components', [\App\Http\Controllers\CompensationWizardController::class, 'updateIncentiveComponents'])
        ->name('compensation.incentive-components.update');
    Route::post('step4/{hrProject}/submit', [\App\Http\Controllers\CompensationWizardController::class, 'submit'])
        ->name('compensation.submit');
    
    // HR System Output
    Route::get('hr-system-output', [\App\Http\Controllers\HrSystemOutputController::class, 'index'])
        ->name('hr-system-output.index');
    
    Route::get('hr-projects/{hrProject}/diagnosis/company-attributes', [\App\Http\Controllers\DiagnosisController::class, 'show'])->name('hr-projects.diagnosis.show');
    Route::post('hr-projects/{hrProject}/diagnosis/company-attributes', [\App\Http\Controllers\DiagnosisController::class, 'storeCompanyAttributes'])->name('hr-projects.diagnosis.store-attributes');
    Route::post('hr-projects/{hrProject}/diagnosis/organizational-sentiment', [\App\Http\Controllers\DiagnosisController::class, 'storeOrganizationalSentiment'])->name('hr-projects.diagnosis.store-sentiment');
    
    // CEO Philosophy - Individual project survey
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
    
    // Step Verification (CEO verifies submitted steps)
    Route::post('hr-projects/{hrProject}/verify/{step}', [\App\Http\Controllers\StepVerificationController::class, 'verify'])
        ->name('hr-projects.verify-step')
        ->where('step', 'diagnosis|organization|performance|compensation');
    
    // HR System Dashboard
    Route::get('hr-projects/{hrProject}/dashboard', [\App\Http\Controllers\HrSystemDashboardController::class, 'show'])->name('hr-projects.dashboard.show');
    
    // HR Report
    Route::get('hr-projects/{hrProject}/report', [\App\Http\Controllers\HrReportController::class, 'show'])->name('hr-projects.report.show');
    
    // HR Policies & Manuals
    Route::get('hr-projects/{hrProject}/policies', [\App\Http\Controllers\HrPoliciesController::class, 'show'])->name('hr-projects.policies.show');
    
    // Support Features (UI/Mock Only)
    Route::get('support/hr-qa', function () {
        return Inertia::render('Support/HRQ&A');
    })->name('support.hr-qa');
    
    Route::get('support/labor-law', function () {
        return Inertia::render('Support/LaborLawAdvisory');
    })->name('support.labor-law');
    
    Route::get('support/diagnosis-request', function () {
        return Inertia::render('Support/DiagnosisRequest');
    })->name('support.diagnosis-request');
});

require __DIR__.'/settings.php';
