<?php

use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {

    // Landing page now uses JSON translations via i18n
    // No need to pass sections from database
    return Inertia::render('Landing/Index', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/contact', function (Request $request) {
    return Inertia::render('Landing/Contact');
})->name('contact');

Route::get('/login', function (Request $request) {
    // If already logged in, redirect to role-based dashboard
    if ($request->user()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('auth/login', [
        'canResetPassword' => true,
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('login');

// Custom email verification callback:
// after verify, send user to dashboard.
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    if (! $request->user()->hasVerifiedEmail()) {
        $request->fulfill();
    }

    return redirect()->route('dashboard')->with('success', 'Email verification successful.');
})->middleware(['auth', 'signed', 'throttle:6,1'])->name('verification.verify');

// Polling endpoint for cross-device verification feedback on verify-email page.
Route::get('/email/verification-status', function (Request $request) {
    return response()->json([
        'verified' => (bool) $request->user()?->hasVerifiedEmail(),
    ]);
})->middleware('auth')->name('verification.status');

// Admin Login Route (separate from regular login)
Route::get('/admin/login', function () {
    return Inertia::render('Admin/AdminLogin', [
        'canResetPassword' => true,
        'status' => session('status'),
    ]);
})->name('admin.login')->middleware('guest');

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

// ========== Public Invitation Routes (No Auth Required) ==========
Route::get('invitations/accept/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'accept'])->name('invitations.accept');
Route::get('invitations/reject/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'reject'])->name('invitations.reject');
Route::get('invitations/set-password/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'showSetPassword'])->name('ceo.set-password');
Route::post('invitations/set-password', [\App\Http\Controllers\CompanyInvitationController::class, 'submitSetPassword'])->name('ceo.set-password.submit');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('pending-approval', [\App\Http\Controllers\BetaPendingController::class, 'show'])->name('beta.pending');

    // Main dashboard with role-based redirect
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard')->middleware('role.dashboard');

    // ========== Company Management ==========
    Route::middleware('role:hr_manager')->group(function () {
        Route::get('companies', [\App\Http\Controllers\CompanyController::class, 'index'])->name('companies.index');
        Route::get('companies/create', [\App\Http\Controllers\CompanyController::class, 'create'])->name('companies.create');
        Route::post('companies', [\App\Http\Controllers\CompanyController::class, 'store'])
            ->middleware('throttle:20,1')
            ->name('companies.store');
        Route::get('companies/{company}', [\App\Http\Controllers\CompanyController::class, 'show'])->name('companies.show');
    });

    // ========== Company Invitations ==========
    Route::middleware('role:hr_manager')->group(function () {
        Route::post('companies/{company}/invite-ceo', [\App\Http\Controllers\CompanyInvitationController::class, 'inviteCeo'])->name('companies.invite-ceo');
        Route::post('invitations/{invitation}/resend', [\App\Http\Controllers\CompanyInvitationController::class, 'resend'])->name('invitations.resend');
        Route::delete('invitations/{invitation}', [\App\Http\Controllers\CompanyInvitationController::class, 'destroy'])->name('invitations.destroy');
    });

    // ========== Role Switch ==========
    Route::middleware('role:hr_manager')->group(function () {
        Route::post('role/switch-to-ceo', [\App\Http\Controllers\RoleSwitchController::class, 'switchToCeo'])->name('role.switch-to-ceo');
    });

    Route::middleware('role:ceo')->group(function () {
        Route::post('role/switch-to-hr', [\App\Http\Controllers\RoleSwitchController::class, 'switchToHr'])->name('role.switch-to-hr');
    });

    // ========== HR Projects ==========
    Route::middleware('role:hr_manager')->group(function () {
        Route::get('hr-projects', [\App\Http\Controllers\HrProjectController::class, 'index'])->name('hr-projects.index');
        Route::get('hr-projects/{hrProject}', [\App\Http\Controllers\HrProjectController::class, 'show'])->name('hr-projects.show');
    });

    // ========== CEO Routes ==========
    Route::middleware('role:ceo')->prefix('ceo')->name('ceo.')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'index'])
            ->name('dashboard');

        // Projects
        Route::get('projects', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'projects'])->name('projects.index');
        Route::get('projects/{hrProject}/verification', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'verification'])->name('projects.verification');

        // Diagnosis Review
        Route::get('review/diagnosis/{hrProject}', [\App\Http\Controllers\CeoReviewController::class, 'reviewDiagnosis'])->name('review.diagnosis');
        Route::post('review/diagnosis/{hrProject}/update', [\App\Http\Controllers\CeoReviewController::class, 'updateDiagnosis'])->name('review.diagnosis.update');
        Route::post('review/diagnosis/{hrProject}/confirm', [\App\Http\Controllers\CeoReviewController::class, 'confirmDiagnosis'])->name('review.diagnosis.confirm');

        // Performance System Review
        Route::get('review/performance-system/{hrProject}', [\App\Http\Controllers\CeoReviewController::class, 'reviewPerformanceSystem'])->name('review.performance-system');

        // Compensation Review
        Route::get('review/compensation/{hrProject}', [\App\Http\Controllers\CeoReviewController::class, 'reviewCompensation'])->name('review.compensation');

        // Step Verification
        Route::post('verify/step/{hrProject}', [\App\Http\Controllers\CeoReviewController::class, 'verifyStep'])->name('verify.step');
        Route::post('revision/step/{hrProject}', [\App\Http\Controllers\CeoReviewController::class, 'requestRevision'])->name('revision.step');

        // Philosophy Survey
        Route::get('philosophy/survey/{hrProject}', [\App\Http\Controllers\CeoPhilosophyController::class, 'showSurvey'])->name('philosophy.survey');
        Route::post('philosophy/survey/{hrProject}', [\App\Http\Controllers\CeoPhilosophyController::class, 'store'])->name('philosophy.store');

        // Job Analysis View
        Route::get('job-analysis/{hrProject}/intro', [\App\Http\Controllers\JobAnalysisController::class, 'ceoIntro'])->name('job-analysis.intro');
        Route::get('review/job-analysis/{hrProject}/job-list', [\App\Http\Controllers\CeoReviewController::class, 'reviewJobListSelection'])->name('review.job-analysis.job-list');
        Route::get('review/job-analysis/{hrProject}/job-definitions', [\App\Http\Controllers\CeoReviewController::class, 'reviewJobDefinitions'])->name('review.job-analysis.job-definitions');

        // Step 5 CEO view: same Final Board (tree). Approve endpoint kept for workflow.
        Route::get('hr-policy-os/{hrProject}', function (\App\Models\HrProject $hrProject) {
            return redirect()->route('ceo.tree.index', $hrProject);
        })->name('hr-policy-os.review');
        Route::post('hr-policy-os/{hrProject}/approve', [\App\Http\Controllers\HrPolicyOsController::class, 'approve'])->name('hr-policy-os.approve');

        // Tree / Final Dashboard (CEO)
        Route::get('tree', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'treeList'])->name('tree.list');
        Route::get('tree/{hrProject}/{tab?}', [\App\Http\Controllers\CeoTreeController::class, 'index'])->name('tree.index');

        // Report (CEO)
        Route::get('report', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'reportList'])->name('report.list');
        Route::get('report/{hrProject}', [\App\Http\Controllers\CeoReportController::class, 'index'])->name('report.index');
        Route::get('report/{hrProject}/download', [\App\Http\Controllers\CeoReportController::class, 'downloadFullReport'])->name('report.download');
        Route::get('report/{hrProject}/download/{step}', [\App\Http\Controllers\CeoReportController::class, 'downloadStepReport'])->name('report.download.step');

        // CEO KPI Review (Performance Step 4-2)
        Route::get('kpi-review', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'kpiReview'])
            ->name('kpi-review.list');
        Route::get('kpi-review/{hrProject}', [\App\Http\Controllers\CeoKpiReviewController::class, 'index'])->name('kpi-review.index');
        Route::post('kpi-review/{hrProject}', [\App\Http\Controllers\CeoKpiReviewController::class, 'store'])->name('kpi-review.store');

        // Final Review (CEO) - removed per requirement
        Route::get('final-review/{hrProject}', function () {
            return redirect()->route('ceo.dashboard');
        })->name('final-review.index');
        Route::post('final-review/{hrProject}/approve', function () {
            return redirect()->route('ceo.dashboard');
        })->name('final-review.approve');
        Route::post('final-review/{hrProject}/revision', function () {
            return redirect()->route('ceo.dashboard');
        })->name('final-review.revision');
    });

    // ========== HR Manager Routes ==========
    Route::middleware('role:hr_manager')->prefix('hr-manager')->name('hr-manager.')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Dashboard\HrManagerDashboardController::class, 'index'])
            ->name('dashboard');

        // Companies (HR Manager)
        Route::get('companies', [\App\Http\Controllers\CompanyController::class, 'index'])->name('companies.index');
        Route::get('companies/create', [\App\Http\Controllers\CompanyController::class, 'create'])->name('companies.create');
        Route::post('companies', [\App\Http\Controllers\CompanyController::class, 'store'])
            ->middleware('throttle:20,1')
            ->name('companies.store');
        Route::get('companies/{company}', [\App\Http\Controllers\CompanyController::class, 'show'])->name('companies.show');

        // Diagnosis Wizard - More specific routes first
        Route::get('diagnosis/{hrProject}/{tab}', [\App\Http\Controllers\DiagnosisWizardController::class, 'showWithProject'])
            ->name('diagnosis.project.tab');
        Route::get('diagnosis/{tab}', [\App\Http\Controllers\DiagnosisWizardController::class, 'show'])
            ->where('tab', '[a-z-]+')
            ->name('diagnosis.tab');
        Route::get('diagnosis', [\App\Http\Controllers\DiagnosisWizardController::class, 'show'])->name('diagnosis.index');

        // Diagnosis API
        Route::post('diagnosis/{hrProject}', [\App\Http\Controllers\DiagnosisController::class, 'store'])->name('diagnosis.store');
        Route::post('diagnosis/{hrProject}/submit', [\App\Http\Controllers\DiagnosisController::class, 'submit'])->name('diagnosis.submit');

        // Organization Design
        Route::get('organization-design/{hrProject}', [\App\Http\Controllers\OrganizationDesignController::class, 'index'])->name('organization-design.index');
        Route::post('organization-design/{hrProject}', [\App\Http\Controllers\OrganizationDesignController::class, 'store'])->name('organization-design.store');
        Route::post('organization-design/{hrProject}/submit', [\App\Http\Controllers\OrganizationDesignController::class, 'submit'])->name('organization-design.submit');

        // Job Analysis Module (incremental save + finalize/submit)
        Route::get('job-analysis/{hrProject}/{tab?}', [\App\Http\Controllers\JobAnalysisController::class, 'index'])->name('job-analysis.index');
        Route::post('job-analysis/{hrProject}/intro/store', [\App\Http\Controllers\JobAnalysisController::class, 'storeIntro'])->name('job-analysis.intro.store');
        Route::post('job-analysis/{hrProject}/policy-snapshot', [\App\Http\Controllers\JobAnalysisController::class, 'storePolicySnapshot'])->name('job-analysis.policy-snapshot.store');
        Route::post('job-analysis/{hrProject}/job-list-selection', [\App\Http\Controllers\JobAnalysisController::class, 'storeJobListSelection'])->name('job-analysis.job-list-selection.store');
        Route::post('job-analysis/{hrProject}/job-definition/{id}', [\App\Http\Controllers\JobAnalysisController::class, 'storeJobDefinition'])->name('job-analysis.job-definition.store');
        Route::post('job-analysis/{hrProject}/org-chart-mapping', [\App\Http\Controllers\JobAnalysisController::class, 'storeOrgChartMapping'])->name('job-analysis.org-chart-mapping.store');
        Route::post('job-analysis/{hrProject}/finalize', [\App\Http\Controllers\JobAnalysisController::class, 'finalize'])->name('job-analysis.finalize');
        Route::post('job-analysis/{hrProject}/submit', [\App\Http\Controllers\JobAnalysisController::class, 'submit'])->name('job-analysis.submit');

        // Performance System
        Route::get('performance-system/{hrProject}/{tab?}', [\App\Http\Controllers\PerformanceSystemController::class, 'index'])->name('performance-system.index');
        Route::post('performance-system/{hrProject}', [\App\Http\Controllers\PerformanceSystemController::class, 'store'])->name('performance-system.store');
        Route::delete('performance-system/{hrProject}/kpis/{organizationalKpi}', [\App\Http\Controllers\PerformanceSystemController::class, 'destroyKpi'])->name('performance-system.kpi.destroy');
        Route::post('performance-system/{hrProject}/submit', [\App\Http\Controllers\PerformanceSystemController::class, 'submit'])->name('performance-system.submit');
        Route::post('performance-system/{hrProject}/send-review-request', [\App\Http\Controllers\KpiReviewController::class, 'sendReviewRequest'])->name('performance-system.send-review-request');
        Route::post('performance-system/{hrProject}/notify-ceo-kpi-review', [\App\Http\Controllers\KpiReviewController::class, 'notifyCeoKpiReview'])->name('performance-system.notify-ceo-kpi-review');
        Route::get('performance-system/{hrProject}/recommended-kpis', [\App\Http\Controllers\PerformanceSystemController::class, 'getRecommendedKpis'])->name('performance-system.recommended-kpis');
        Route::get('performance-system/{hrProject}/kpi-edit-history/{organizationalKpi}', [\App\Http\Controllers\Admin\KpiEditHistoryController::class, 'show'])->name('performance-system.kpi-edit-history.show');

        // Compensation System
        Route::get('compensation-system/{hrProject}/{tab?}', [\App\Http\Controllers\CompensationSystemController::class, 'index'])->name('compensation-system.index');
        Route::post('compensation-system/{hrProject}', [\App\Http\Controllers\CompensationSystemController::class, 'store'])->name('compensation-system.store');
        Route::post('compensation-system/{hrProject}/submit', [\App\Http\Controllers\CompensationSystemController::class, 'submit'])->name('compensation-system.submit');

        // Final Dashboard (Step 5) = Design Progress board (tree route). Legacy HR Policy OS URL redirects here.
        Route::get('hr-policy-os/{hrProject}', function (\App\Models\HrProject $hrProject) {
            return redirect()->route('hr-manager.tree.index', $hrProject);
        })->name('hr-policy-os.index');

        // Tree / Final Board (HR Manager)
        Route::get('tree/{hrProject}/{tab?}', [\App\Http\Controllers\HrTreeController::class, 'index'])->name('tree.index');
        Route::post('tree/{hrProject}/submit-final', [\App\Http\Controllers\HrTreeController::class, 'submitFinal'])->name('tree.submit-final');

        // Report (HR Manager)
        Route::get('report/{hrProject}', [\App\Http\Controllers\HrReportController::class, 'index'])->name('report.index');
        Route::post('report/{hrProject}/upload', [\App\Http\Controllers\HrReportController::class, 'upload'])->name('report.upload');
        Route::get('report/{hrProject}/upload/{reportUpload}/download', [\App\Http\Controllers\HrReportController::class, 'downloadUpload'])->name('report.upload.download');
        Route::get('report/{hrProject}/download', [\App\Http\Controllers\HrReportController::class, 'downloadFullReport'])->name('report.download');
        Route::get('report/{hrProject}/download/{step}', [\App\Http\Controllers\HrReportController::class, 'downloadStepReport'])->name('report.download.step');
    });

    // ========== Admin Routes ==========
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
        Route::get('beta-access', [\App\Http\Controllers\Admin\BetaAccessController::class, 'index'])->name('beta-access.index');
        Route::post('beta-access/{user}/approve', [\App\Http\Controllers\Admin\BetaAccessController::class, 'approve'])->name('beta-access.approve');
        Route::get('project-tree', [\App\Http\Controllers\Admin\DashboardController::class, 'projectTree'])->name('project-tree');

        // HR Projects (Admin can view all projects)
        Route::get('hr-projects', [\App\Http\Controllers\HrProjectController::class, 'index'])->name('hr-projects.index');
        Route::get('hr-projects/{hrProject}', [\App\Http\Controllers\HrProjectController::class, 'show'])->name('hr-projects.show');

        // Review
        Route::get('review/{hrProject}', [\App\Http\Controllers\AdminReviewController::class, 'index'])->name('review.index');
        Route::post('review/{hrProject}/comment', [\App\Http\Controllers\AdminReviewController::class, 'addComment'])->name('review.comment');

        // KPI Review
        Route::get('kpi-review/{hrProject}', [\App\Http\Controllers\Admin\KpiReviewController::class, 'index'])->name('kpi-review.index');
        Route::post('kpi-review/{hrProject}', [\App\Http\Controllers\Admin\KpiReviewController::class, 'store'])->name('kpi-review.store');

        // CEO Questions Management
        Route::resource('questions/ceo', \App\Http\Controllers\Admin\DiagnosisQuestionController::class)
            ->parameters([
                'ceo' => 'diagnosisQuestion'
            ])
            ->names([
                'index' => 'questions.ceo.index',
                'create' => 'questions.ceo.create',
                'store' => 'questions.ceo.store',
                'show' => 'questions.ceo.show',
                'edit' => 'questions.ceo.edit',
                'update' => 'questions.ceo.update',
                'destroy' => 'questions.ceo.destroy',
            ]);
        Route::post('questions/ceo/reorder', [\App\Http\Controllers\Admin\DiagnosisQuestionController::class, 'reorder'])->name('questions.ceo.reorder');

        // Policy Snapshot Questions
        Route::resource('policy-snapshot', \App\Http\Controllers\Admin\PolicySnapshotController::class)
            ->parameters([
                'policy-snapshot' => 'policySnapshotQuestion'
            ])
            ->names([
                'index' => 'policy-snapshot.index',
                'create' => 'policy-snapshot.create',
                'store' => 'policy-snapshot.store',
                'edit' => 'policy-snapshot.edit',
                'update' => 'policy-snapshot.update',
                'destroy' => 'policy-snapshot.destroy',
            ]);

        // HR Issues Management
        Route::resource('hr-issues', \App\Http\Controllers\Admin\HrIssueController::class)
            ->parameters([
                'hr-issues' => 'hrIssue'
            ])
            ->names([
                'index' => 'hr-issues.index',
                'create' => 'hr-issues.create',
                'store' => 'hr-issues.store',
                'edit' => 'hr-issues.edit',
                'update' => 'hr-issues.update',
                'destroy' => 'hr-issues.destroy',
            ]);

        // Industries Management
        Route::resource('industries', \App\Http\Controllers\Admin\IndustryController::class)->names([
            'index' => 'industries.index',
            'create' => 'industries.create',
            'store' => 'industries.store',
            'edit' => 'industries.edit',
            'update' => 'industries.update',
            'destroy' => 'industries.destroy',
        ]);

        // CEO Management
        Route::get('ceo', [\App\Http\Controllers\Admin\CeoController::class, 'index'])->name('ceo.index');
        Route::post('ceo/create', [\App\Http\Controllers\Admin\CeoController::class, 'store'])->name('ceo.create');
        Route::get('ceos/{ceo}', [\App\Http\Controllers\Admin\CeoController::class, 'show'])
            ->name('ceos.show');
        Route::get('ceos/{ceo}/edit', [\App\Http\Controllers\Admin\CeoController::class, 'edit'])
            ->name('ceos.edit');
        Route::put('ceos/{ceo}', [\App\Http\Controllers\Admin\CeoController::class, 'update'])
            ->name('ceos.update');
        Route::delete('ceos/{ceo}', [\App\Http\Controllers\Admin\CeoController::class, 'destroy'])
            ->name('ceos.destroy');
        // Industry Subcategories Management (Full CRUD)
        Route::resource('subcategories', \App\Http\Controllers\Admin\IndustrySubCategoryController::class)->parameters([
            'subcategories' => 'subCategory'
        ])->names([
            'index' => 'subcategories.index',
            'create' => 'subcategories.create',
            'store' => 'subcategories.store',
            'edit' => 'subcategories.edit',
            'update' => 'subcategories.update',
            'destroy' => 'subcategories.destroy',
        ]);

        // Keep old routes for backward compatibility (used in Industries Edit page)
        Route::post('industries/{industry}/subcategories', [\App\Http\Controllers\Admin\IndustryController::class, 'storeSubCategory'])->name('industries.subcategories.store');
        Route::put('industries/subcategories/{subCategory}', [\App\Http\Controllers\Admin\IndustryController::class, 'updateSubCategory'])->name('industries.subcategories.update');
        Route::delete('industries/subcategories/{subCategory}', [\App\Http\Controllers\Admin\IndustryController::class, 'destroySubCategory'])->name('industries.subcategories.destroy');

        // Job Keywords Management
        // Job Analysis Admin Management
        Route::resource('job-analysis/intro-texts', \App\Http\Controllers\Admin\JobAnalysisIntroController::class)->names([
            'index' => 'job-analysis.intro-texts.index',
            'create' => 'job-analysis.intro-texts.create',
            'store' => 'job-analysis.intro-texts.store',
            'show' => 'job-analysis.intro-texts.show',
            'edit' => 'job-analysis.intro-texts.edit',
            'update' => 'job-analysis.intro-texts.update',
            'destroy' => 'job-analysis.intro-texts.destroy',
        ]);

        Route::resource('job-keywords', \App\Http\Controllers\Admin\JobKeywordController::class)->names([
            'index' => 'job-keywords.index',
            'create' => 'job-keywords.create',
            'store' => 'job-keywords.store',
            'edit' => 'job-keywords.edit',
            'update' => 'job-keywords.update',
            'destroy' => 'job-keywords.destroy',
        ]);

        // Job Definition Templates
        Route::resource('job-templates', \App\Http\Controllers\Admin\JobDefinitionTemplateController::class)->names([
            'index' => 'job-templates.index',
            'create' => 'job-templates.create',
            'store' => 'job-templates.store',
            'edit' => 'job-templates.edit',
            'update' => 'job-templates.update',
            'destroy' => 'job-templates.destroy',
        ]);

        // KPI Templates (Recommended KPIs by org / company)
        Route::resource('kpi-templates', \App\Http\Controllers\Admin\KpiTemplateController::class)->parameters([
            'kpi-templates' => 'kpiTemplate',
        ])->names([
            'index' => 'kpi-templates.index',
            'create' => 'kpi-templates.create',
            'store' => 'kpi-templates.store',
            'edit' => 'kpi-templates.edit',
            'update' => 'kpi-templates.update',
            'destroy' => 'kpi-templates.destroy',
        ]);

        // Performance Snapshot Questions
        Route::resource(
            'performance-snapshot',
            \App\Http\Controllers\Admin\PerformanceSnapshotQuestionController::class
        )
            ->parameters([
                'performance-snapshot' => 'performanceSnapshotQuestion'
            ])
            ->names([
                'index' => 'performance-snapshot.index',
                'create' => 'performance-snapshot.create',
                'store' => 'performance-snapshot.store',
                'show' => 'performance-snapshot.show',
                'edit' => 'performance-snapshot.edit',
                'update' => 'performance-snapshot.update',
                'destroy' => 'performance-snapshot.destroy',
            ]);

        // Evaluation Model Guidance
        Route::resource('evaluation-model-guidance', \App\Http\Controllers\Admin\EvaluationModelGuidanceController::class)->names([
            'index' => 'evaluation-model-guidance.index',
            'create' => 'evaluation-model-guidance.create',
            'store' => 'evaluation-model-guidance.store',
            'edit' => 'evaluation-model-guidance.edit',
            'update' => 'evaluation-model-guidance.update',
            'destroy' => 'evaluation-model-guidance.destroy',
        ]);

        // Job Evaluation Model Recommendations
        Route::resource('job-model-recommendation', \App\Http\Controllers\Admin\JobEvaluationModelRecommendationController::class)->names([
            'index' => 'job-model-recommendation.index',
            'store' => 'job-model-recommendation.store',
            'update' => 'job-model-recommendation.update',
            'destroy' => 'job-model-recommendation.destroy',
        ]);

        // Evaluation Option Guidance
        Route::resource('evaluation-option-guidance', \App\Http\Controllers\Admin\EvaluationOptionGuidanceController::class)->names([
            'index' => 'evaluation-option-guidance.index',
            'create' => 'evaluation-option-guidance.create',
            'store' => 'evaluation-option-guidance.store',
            'edit' => 'evaluation-option-guidance.edit',
            'update' => 'evaluation-option-guidance.update',
            'destroy' => 'evaluation-option-guidance.destroy',
        ]);

        // KPI Edit History
        Route::get('kpi-edit-history', [\App\Http\Controllers\Admin\KpiEditHistoryController::class, 'index'])->name('kpi-edit-history.index');
        Route::get('kpi-edit-history/{organizationalKpi}', [\App\Http\Controllers\Admin\KpiEditHistoryController::class, 'show'])->name('kpi-edit-history.show');
        Route::post('performance-snapshot/reorder', [\App\Http\Controllers\Admin\PerformanceSnapshotQuestionController::class, 'reorder'])->name('performance-snapshot.reorder');

        // Compensation Snapshot Questions Management
        Route::resource('compensation-snapshot', \App\Http\Controllers\Admin\CompensationSnapshotQuestionController::class)->names([
            'index' => 'compensation-snapshot.index',
            'create' => 'compensation-snapshot.create',
            'store' => 'compensation-snapshot.store',
            'show' => 'compensation-snapshot.show',
            'edit' => 'compensation-snapshot.edit',
            'update' => 'compensation-snapshot.update',
            'destroy' => 'compensation-snapshot.destroy',
        ]);
        Route::post('compensation-snapshot/reorder', [\App\Http\Controllers\Admin\CompensationSnapshotQuestionController::class, 'reorder'])->name('compensation-snapshot.reorder');

        // Translations Management (JSON-based)
        Route::get('translations', [\App\Http\Controllers\Admin\TranslationController::class, 'index'])->name('translations.index');
        Route::get('translations/edit', [\App\Http\Controllers\Admin\TranslationController::class, 'edit'])->name('translations.edit');
        Route::put('translations', [\App\Http\Controllers\Admin\TranslationController::class, 'update'])->name('translations.update');
        Route::post('translations', [\App\Http\Controllers\Admin\TranslationController::class, 'store'])->name('translations.store');
        Route::post('translations/update-key', [\App\Http\Controllers\Admin\TranslationController::class, 'updateKey'])->name('translations.update-key');
        Route::delete('translations', [\App\Http\Controllers\Admin\TranslationController::class, 'destroy'])->name('translations.destroy');

        // Landing Page Management (JSON-based, edit only)
        Route::get('landing-page', [\App\Http\Controllers\Admin\LandingPageController::class, 'index'])->name('landing-page.index');
        Route::put('landing-page', [\App\Http\Controllers\Admin\LandingPageController::class, 'update'])->name('landing-page.update');

        // Intro Texts Management
        Route::resource('intro-texts', \App\Http\Controllers\Admin\IntroTextController::class)->names([
            'index' => 'intro-texts.index',
            'create' => 'intro-texts.create',
            'store' => 'intro-texts.store',
            'edit' => 'intro-texts.edit',
            'update' => 'intro-texts.update',
            'destroy' => 'intro-texts.destroy',
        ]);

        // Consultant Recommendations (Step 3.5, 4.5 & 5)
        Route::get('recommendations/performance/{hrProject}', [\App\Http\Controllers\Admin\ConsultantRecommendationController::class, 'showPerformanceRecommendation'])
            ->name('recommendations.performance');
        Route::post('recommendations/performance/{hrProject}', [\App\Http\Controllers\Admin\ConsultantRecommendationController::class, 'storePerformanceRecommendation'])
            ->name('recommendations.performance.store');
        Route::get('recommendations/compensation/{hrProject}', [\App\Http\Controllers\Admin\ConsultantRecommendationController::class, 'showCompensationRecommendation'])
            ->name('recommendations.compensation');
        Route::post('recommendations/compensation/{hrProject}', [\App\Http\Controllers\Admin\ConsultantRecommendationController::class, 'storeCompensationRecommendation'])
            ->name('recommendations.compensation.store');

        // HR Policy OS Recommendation (Step 5)
        Route::get('recommendations/hr-policy-os/{hrProject}', [\App\Http\Controllers\Admin\ConsultantRecommendationController::class, 'showHrPolicyOsRecommendation'])
            ->name('recommendations.hr-policy-os');
        Route::post('recommendations/hr-policy-os/{hrProject}', [\App\Http\Controllers\Admin\ConsultantRecommendationController::class, 'storeHrPolicyOsRecommendation'])
            ->name('recommendations.hr-policy-os.store');

        // Final Dashboard (Step 5): legacy URL redirects to Tree view
        Route::get('hr-policy-os/{hrProject}', function (\App\Models\HrProject $hrProject) {
            return redirect()->route('admin.tree.index', $hrProject);
        })->name('hr-policy-os.index');

        // Tree Management (Admin Only)
        Route::get('tree/{hrProject}/{tab?}', [\App\Http\Controllers\Admin\TreeManagementController::class, 'index'])->name('tree.index');
        Route::post('tree/{hrProject}', [\App\Http\Controllers\Admin\TreeManagementController::class, 'store'])->name('tree.store');
        Route::post('tree/{hrProject}/update', [\App\Http\Controllers\Admin\TreeManagementController::class, 'update'])->name('tree.update');

        // Report (Admin)
        Route::get('report/{hrProject}', [\App\Http\Controllers\Admin\ReportController::class, 'index'])->name('report.index');
        Route::get('report/{hrProject}/download', [\App\Http\Controllers\Admin\ReportController::class, 'downloadFullReport'])->name('report.download');
        Route::get('report/{hrProject}/download/{step}', [\App\Http\Controllers\Admin\ReportController::class, 'downloadStepReport'])->name('report.download.step');

        // HR System Overview (Admin)
        Route::get('hr-system/{hrProject}', [\App\Http\Controllers\HrSystemOverviewController::class, 'index'])->name('hr-system.overview');
    });

    // ========== HR System Overview ==========
    Route::middleware('role:hr_manager')->group(function () {
        Route::get('hr-system/{hrProject}', [\App\Http\Controllers\HrSystemOverviewController::class, 'index'])->name('hr-system.overview');
    });

});

// ========== KPI Review Magic Link (No Authentication Required) ==========
Route::get('kpi-review/token/{token}', [\App\Http\Controllers\KpiReviewController::class, 'show'])->name('kpi-review.token');
Route::get('kpi-review/token/{token}/organization/{organizationName}', [\App\Http\Controllers\KpiReviewController::class, 'getKpisForOrganization'])->name('kpi-review.token.organization');
Route::post('kpi-review/token/{token}', [\App\Http\Controllers\KpiReviewController::class, 'store'])->name('kpi-review.token.store');

require __DIR__ . '/settings.php';
