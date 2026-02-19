<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    // Load landing page sections from database for both languages
    $sections = [
        'ko' => [],
        'en' => [],
    ];
    try {
        if (Schema::hasTable('landing_page_sections')) {
            $sections['ko'] = \App\Models\LandingPageSection::getActiveSections('ko');
            $sections['en'] = \App\Models\LandingPageSection::getActiveSections('en');
        }
    } catch (\Exception $e) {
        // Table might not exist yet
        $sections = [
            'ko' => [],
            'en' => [],
        ];
    }

    return Inertia::render('Landing/Index', [
        'canRegister' => Features::enabled(Features::registration()),
        'sections' => $sections,
    ]);
})->name('home');

Route::get('/login', function () {
    return Inertia::render('auth/login', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('login');

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

Route::middleware(['auth'])->group(function () {
    // Main dashboard with role-based redirect
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard')->middleware('role.dashboard');
    
    // ========== Company Management ==========
    Route::middleware('role:hr_manager')->group(function () {
        Route::get('companies', [\App\Http\Controllers\CompanyController::class, 'index'])->name('companies.index');
        Route::get('companies/create', [\App\Http\Controllers\CompanyController::class, 'create'])->name('companies.create');
        Route::post('companies', [\App\Http\Controllers\CompanyController::class, 'store'])->name('companies.store');
    });
    
    Route::get('companies/{company}', [\App\Http\Controllers\CompanyController::class, 'show'])->name('companies.show');
    
    // ========== Company Invitations ==========
    Route::middleware('role:hr_manager')->group(function () {
        Route::post('companies/{company}/invite-ceo', [\App\Http\Controllers\CompanyInvitationController::class, 'inviteCeo'])->name('companies.invite-ceo');
    });
    
    Route::get('invitations/accept/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'accept'])->name('invitations.accept');
    Route::get('invitations/reject/{token}', [\App\Http\Controllers\CompanyInvitationController::class, 'reject'])->name('invitations.reject');
    
    // ========== HR Projects ==========
    Route::get('hr-projects', [\App\Http\Controllers\HrProjectController::class, 'index'])->name('hr-projects.index');
    Route::get('hr-projects/{hrProject}', [\App\Http\Controllers\HrProjectController::class, 'show'])->name('hr-projects.show');
    
    // ========== CEO Routes ==========
    Route::middleware('role:ceo')->prefix('ceo')->name('ceo.')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Dashboard\CeoDashboardController::class, 'index'])
            ->name('dashboard');
        
        // Diagnosis Review
        Route::get('review/diagnosis/{hrProject}', [\App\Http\Controllers\CeoReviewController::class, 'reviewDiagnosis'])->name('review.diagnosis');
        Route::post('review/diagnosis/{hrProject}/update', [\App\Http\Controllers\CeoReviewController::class, 'updateDiagnosis'])->name('review.diagnosis.update');
        Route::post('review/diagnosis/{hrProject}/confirm', [\App\Http\Controllers\CeoReviewController::class, 'confirmDiagnosis'])->name('review.diagnosis.confirm');
        
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
        
        // HR Policy OS Review (Step 5)
        Route::get('hr-policy-os/{hrProject}', [\App\Http\Controllers\HrPolicyOsController::class, 'ceoReview'])->name('hr-policy-os.review');
        Route::post('hr-policy-os/{hrProject}/approve', [\App\Http\Controllers\HrPolicyOsController::class, 'approve'])->name('hr-policy-os.approve');
        
        // CEO KPI Review (Performance Step 4-2)
        Route::get('kpi-review/{hrProject}', [\App\Http\Controllers\CeoKpiReviewController::class, 'index'])->name('kpi-review.index');
        Route::post('kpi-review/{hrProject}', [\App\Http\Controllers\CeoKpiReviewController::class, 'store'])->name('kpi-review.store');
        
        // Final Review
        Route::get('final-review/{hrProject}', [\App\Http\Controllers\FinalReviewController::class, 'index'])->name('final-review.index');
        Route::post('final-review/{hrProject}/approve', [\App\Http\Controllers\FinalReviewController::class, 'approve'])->name('final-review.approve');
        Route::post('final-review/{hrProject}/revision', [\App\Http\Controllers\FinalReviewController::class, 'requestRevision'])->name('final-review.revision');
    });
    
    // ========== HR Manager Routes ==========
    Route::middleware('role:hr_manager')->prefix('hr-manager')->name('hr-manager.')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Dashboard\HrManagerDashboardController::class, 'index'])
            ->name('dashboard');
        
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
        
        // Job Analysis Module
        Route::get('job-analysis/{hrProject}/intro', [\App\Http\Controllers\JobAnalysisController::class, 'intro'])->name('job-analysis.intro');
        Route::post('job-analysis/{hrProject}/intro/store', [\App\Http\Controllers\JobAnalysisController::class, 'storeIntro'])->name('job-analysis.intro.store');
        Route::get('job-analysis/{hrProject}/policy-snapshot', [\App\Http\Controllers\JobAnalysisController::class, 'policySnapshot'])->name('job-analysis.policy-snapshot');
        Route::post('job-analysis/{hrProject}/policy-snapshot', [\App\Http\Controllers\JobAnalysisController::class, 'storePolicySnapshot'])->name('job-analysis.policy-snapshot.store');
        Route::get('job-analysis/{hrProject}/job-list-selection', [\App\Http\Controllers\JobAnalysisController::class, 'jobListSelection'])->name('job-analysis.job-list-selection');
        Route::post('job-analysis/{hrProject}/job-list-selection', [\App\Http\Controllers\JobAnalysisController::class, 'storeJobListSelection'])->name('job-analysis.job-list-selection.store');
        Route::get('job-analysis/{hrProject}/job-definition/{jobDefinition?}', [\App\Http\Controllers\JobAnalysisController::class, 'jobDefinition'])->name('job-analysis.job-definition');
        Route::post('job-analysis/{hrProject}/job-definition/{jobDefinition}', [\App\Http\Controllers\JobAnalysisController::class, 'storeJobDefinition'])->name('job-analysis.job-definition.store');
        Route::get('job-analysis/{hrProject}/finalization', [\App\Http\Controllers\JobAnalysisController::class, 'finalization'])->name('job-analysis.finalization');
        Route::post('job-analysis/{hrProject}/finalize', [\App\Http\Controllers\JobAnalysisController::class, 'finalize'])->name('job-analysis.finalize');
        Route::get('job-analysis/{hrProject}/org-chart-mapping', [\App\Http\Controllers\JobAnalysisController::class, 'orgChartMapping'])->name('job-analysis.org-chart-mapping');
        Route::post('job-analysis/{hrProject}/org-chart-mapping', [\App\Http\Controllers\JobAnalysisController::class, 'storeOrgChartMapping'])->name('job-analysis.org-chart-mapping.store');
        Route::post('job-analysis/{hrProject}/submit', [\App\Http\Controllers\JobAnalysisController::class, 'submit'])->name('job-analysis.submit');
        
        // Performance System
        Route::get('performance-system/{hrProject}/{tab?}', [\App\Http\Controllers\PerformanceSystemController::class, 'index'])->name('performance-system.index');
        Route::post('performance-system/{hrProject}', [\App\Http\Controllers\PerformanceSystemController::class, 'store'])->name('performance-system.store');
        Route::post('performance-system/{hrProject}/submit', [\App\Http\Controllers\PerformanceSystemController::class, 'submit'])->name('performance-system.submit');
        Route::post('performance-system/{hrProject}/send-review-request', [\App\Http\Controllers\KpiReviewController::class, 'sendReviewRequest'])->name('performance-system.send-review-request');
        
        // Compensation System
        Route::get('compensation-system/{hrProject}/{tab?}', [\App\Http\Controllers\CompensationSystemController::class, 'index'])->name('compensation-system.index');
        Route::post('compensation-system/{hrProject}', [\App\Http\Controllers\CompensationSystemController::class, 'store'])->name('compensation-system.store');
        Route::post('compensation-system/{hrProject}/submit', [\App\Http\Controllers\CompensationSystemController::class, 'submit'])->name('compensation-system.submit');
        
        // HR Policy OS (Step 5)
        Route::get('hr-policy-os/{hrProject}', [\App\Http\Controllers\HrPolicyOsController::class, 'index'])->name('hr-policy-os.index');
        Route::post('hr-policy-os/{hrProject}', [\App\Http\Controllers\HrPolicyOsController::class, 'store'])->name('hr-policy-os.store');
        Route::post('hr-policy-os/{hrProject}/submit', [\App\Http\Controllers\HrPolicyOsController::class, 'submit'])->name('hr-policy-os.submit');
    });
    
    // ========== Admin Routes ==========
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
        Route::get('project-tree', [\App\Http\Controllers\Admin\DashboardController::class, 'projectTree'])->name('project-tree');
        
        // Review
        Route::get('review/{hrProject}', [\App\Http\Controllers\AdminReviewController::class, 'index'])->name('review.index');
        Route::post('review/{hrProject}/comment', [\App\Http\Controllers\AdminReviewController::class, 'addComment'])->name('review.comment');
        
        // CEO Questions Management
        Route::resource('questions/ceo', \App\Http\Controllers\Admin\DiagnosisQuestionController::class)->names([
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
        Route::resource('policy-snapshot', \App\Http\Controllers\Admin\PolicySnapshotController::class)->names([
            'index' => 'policy-snapshot.index',
            'create' => 'policy-snapshot.create',
            'store' => 'policy-snapshot.store',
            'edit' => 'policy-snapshot.edit',
            'update' => 'policy-snapshot.update',
            'destroy' => 'policy-snapshot.destroy',
        ]);
        
        // HR Issues Management
        Route::resource('hr-issues', \App\Http\Controllers\Admin\HrIssueController::class)->names([
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
        Route::post('ceo/create', [\App\Http\Controllers\Admin\CeoController::class, 'store'])->name('ceo.create');
        // Industry Subcategories Management (Full CRUD)
        Route::resource('subcategories', \App\Http\Controllers\Admin\IndustrySubCategoryController::class)->names([
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
        
        // Performance Snapshot Questions
        Route::resource('performance-snapshot', \App\Http\Controllers\Admin\PerformanceSnapshotQuestionController::class)->names([
            'index' => 'performance-snapshot.index',
            'create' => 'performance-snapshot.create',
            'store' => 'performance-snapshot.store',
            'show' => 'performance-snapshot.show',
            'edit' => 'performance-snapshot.edit',
            'update' => 'performance-snapshot.update',
            'destroy' => 'performance-snapshot.destroy',
        ]);
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
        
        // Translations Management
        Route::resource('translations', \App\Http\Controllers\Admin\TranslationController::class)->names([
            'index' => 'translations.index',
            'create' => 'translations.create',
            'store' => 'translations.store',
            'edit' => 'translations.edit',
            'update' => 'translations.update',
            'destroy' => 'translations.destroy',
        ]);
        Route::post('translations/bulk-import', [\App\Http\Controllers\Admin\TranslationController::class, 'bulkImport'])->name('translations.bulk-import');
        
        // Landing Page Management
        Route::resource('landing-page', \App\Http\Controllers\Admin\LandingPageController::class)->names([
            'index' => 'landing-page.index',
            'create' => 'landing-page.create',
            'store' => 'landing-page.store',
            'edit' => 'landing-page.edit',
            'update' => 'landing-page.update',
            'destroy' => 'landing-page.destroy',
        ]);
        Route::post('landing-page/bulk-update', [\App\Http\Controllers\Admin\LandingPageController::class, 'bulkUpdate'])->name('landing-page.bulk-update');
        
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
        
        // Tree Management (Admin Only)
        Route::get('tree/{hrProject}/{tab?}', [\App\Http\Controllers\Admin\TreeManagementController::class, 'index'])->name('tree.index');
        Route::post('tree/{hrProject}', [\App\Http\Controllers\Admin\TreeManagementController::class, 'store'])->name('tree.store');
        Route::post('tree/{hrProject}/update', [\App\Http\Controllers\Admin\TreeManagementController::class, 'update'])->name('tree.update');
    });
    
    // ========== HR System Overview (Shared) ==========
    Route::get('hr-system/{hrProject}', [\App\Http\Controllers\HrSystemOverviewController::class, 'index'])->name('hr-system.overview');
    
    // ========== KPI Review Magic Link (No Authentication Required) ==========
    Route::get('kpi-review/token/{token}', [\App\Http\Controllers\KpiReviewController::class, 'show'])->name('kpi-review.token');
    Route::post('kpi-review/token/{token}', [\App\Http\Controllers\KpiReviewController::class, 'store'])->name('kpi-review.token.store');
});

require __DIR__.'/settings.php';
