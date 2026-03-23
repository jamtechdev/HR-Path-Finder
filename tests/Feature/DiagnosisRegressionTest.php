<?php

/**
 * Regression coverage for HR Path-Finder / diagnosis stability (org charts, workforce split).
 * Run `php artisan test --filter=DiagnosisRegression` after changes to DiagnosisController or StoreDiagnosisRequest.
 */

use App\Enums\StepStatus;
use App\Models\Company;
use App\Models\Diagnosis;
use App\Models\HrProject;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'hr_manager', 'guard_name' => 'web']);
});

/**
 * @return array{0: User, 1: HrProject}
 */
function diagnosisRegressionSetup(): array
{
    $user = User::factory()->create();
    $user->assignRole('hr_manager');

    $company = Company::create([
        'name' => 'Acme Regression Co',
        'public_listing_status' => 'private',
        'created_by' => $user->id,
    ]);
    $company->users()->attach($user->id, ['role' => 'hr_manager']);

    $project = HrProject::create([
        'company_id' => $company->id,
        'status' => 'active',
        'step_statuses' => [],
    ]);

    return [$user, $project];
}

test('diagnosis update does not wipe organizational charts when empty array is posted', function () {
    [$user, $project] = diagnosisRegressionSetup();

    $diagnosis = Diagnosis::create([
        'hr_project_id' => $project->id,
        'status' => StepStatus::IN_PROGRESS,
        'present_headcount' => 50,
        'organizational_charts' => ['2024' => 'org-charts/preserved.png'],
    ]);

    $this->actingAs($user)
        ->from(route('hr-manager.diagnosis.project.tab', [$project, 'company-info']))
        ->post(route('hr-manager.diagnosis.store', $project), [
            'industry_category' => 'Technology',
            'organizational_charts' => [],
        ])
        ->assertRedirect();

    expect($diagnosis->fresh()->organizational_charts)->toBe(['2024' => 'org-charts/preserved.png']);
});

test('diagnosis update merges new organizational chart years with stored paths', function () {
    [$user, $project] = diagnosisRegressionSetup();

    $diagnosis = Diagnosis::create([
        'hr_project_id' => $project->id,
        'status' => StepStatus::IN_PROGRESS,
        'present_headcount' => 50,
        'organizational_charts' => ['2024' => 'org-charts/y2024.png'],
    ]);

    $this->actingAs($user)
        ->post(route('hr-manager.diagnosis.store', $project), [
            'organizational_charts' => ['2025' => 'org-charts/y2025.png'],
        ])
        ->assertRedirect();

    expect($diagnosis->fresh()->organizational_charts)->toBe([
        '2024' => 'org-charts/y2024.png',
        '2025' => 'org-charts/y2025.png',
    ]);
});

test('diagnosis update rejects workforce when full-time plus contract does not match present headcount', function () {
    [$user, $project] = diagnosisRegressionSetup();

    Diagnosis::create([
        'hr_project_id' => $project->id,
        'status' => StepStatus::IN_PROGRESS,
        'present_headcount' => 100,
    ]);

    $this->actingAs($user)
        ->from(route('hr-manager.diagnosis.project.tab', [$project, 'workforce']))
        ->post(route('hr-manager.diagnosis.store', $project), [
            'present_headcount' => 100,
            'full_time_headcount' => 60,
            'contract_headcount' => 30,
        ])
        ->assertSessionHasErrors('present_headcount');
});

test('diagnosis update accepts workforce when full-time plus contract equals present headcount', function () {
    [$user, $project] = diagnosisRegressionSetup();

    Diagnosis::create([
        'hr_project_id' => $project->id,
        'status' => StepStatus::IN_PROGRESS,
        'present_headcount' => 100,
    ]);

    $this->actingAs($user)
        ->post(route('hr-manager.diagnosis.store', $project), [
            'present_headcount' => 100,
            'full_time_headcount' => 70,
            'contract_headcount' => 30,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(Diagnosis::where('hr_project_id', $project->id)->first())
        ->full_time_headcount->toBe(70)
        ->contract_headcount->toBe(30);
});
