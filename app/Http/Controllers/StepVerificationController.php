<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use App\Models\HrProjectAudit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StepVerificationController extends Controller
{
    /**
     * Verify a submitted step and unlock the next step.
     */
    public function verify(Request $request, HrProject $hrProject, string $step): RedirectResponse
    {
        // Only CEO can verify
        $user = Auth::user();
        if (!$user->hasRole('ceo')) {
            abort(403, 'Only CEO can verify steps.');
        }

        // Verify CEO belongs to the company
        $company = $hrProject->company;
        $ceoCompanies = $user->companies()->wherePivot('role', 'ceo')->pluck('companies.id');
        if (!$ceoCompanies->contains($company->id)) {
            abort(403, 'You do not have access to this project.');
        }

        $hrProject->initializeStepStatuses();
        $currentStatus = $hrProject->getStepStatus($step);

        // Only verify if step is submitted
        if ($currentStatus !== 'submitted') {
            return redirect()->back()->withErrors([
                'verification' => 'This step has not been submitted yet.',
            ]);
        }

        DB::transaction(function () use ($hrProject, $step) {
            $stepOrder = [
                'diagnosis' => 'organization',
                'organization' => 'performance',
                'performance' => 'compensation',
                'compensation' => null, // Last step
            ];

            $nextStep = $stepOrder[$step] ?? null;

            if ($nextStep) {
                // Unlock next step - the step is already unlocked because previous step is submitted
                // But we ensure the current_step is updated and next step status is initialized
                $hrProject->initializeStepStatuses();
                
                // Update current_step to next step
                $hrProject->update([
                    'current_step' => $nextStep,
                ]);
                
                // Ensure next step status is at least 'not_started' (it's already unlocked)
                // The isStepUnlocked method will return true because previous step is 'submitted'
            }

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => "step_verified_{$step}",
                'step' => $step,
            ]);
        });

        $stepNames = [
            'diagnosis' => 'Step 2: Organization Design',
            'organization' => 'Step 3: Performance System',
            'performance' => 'Step 4: Compensation System',
            'compensation' => 'HR System Output',
        ];

        $nextStepName = $stepNames[$step] ?? 'Next Step';
        $nextStepRoutes = [
            'diagnosis' => route('organization.index'),
            'organization' => route('performance.index'),
            'performance' => route('compensation.index'),
            'compensation' => route('hr-system-output.index'),
        ];

        $nextStepRoute = $nextStepRoutes[$step] ?? route('dashboard.hr-manager');

        // Reload project data
        $hrProject->refresh();
        $hrProject->load(['company', 'ceoPhilosophy', 'organizationDesign', 'performanceSystem', 'compensationSystem']);
        
        $user = Auth::user();
        $companies = $user->companies()->wherePivot('role', 'ceo')->get();
        
        // Get step statuses
        $hrProject->initializeStepStatuses();
        $stepStatuses = [
            'diagnosis' => $hrProject->getStepStatus('diagnosis'),
            'organization' => $hrProject->getStepStatus('organization'),
            'performance' => $hrProject->getStepStatus('performance'),
            'compensation' => $hrProject->getStepStatus('compensation'),
        ];
        
        $stepsStatus = [
            'diagnosis' => in_array($stepStatuses['diagnosis'], ['in_progress', 'submitted']),
            'organization' => in_array($stepStatuses['organization'], ['in_progress', 'submitted']),
            'performance' => in_array($stepStatuses['performance'], ['in_progress', 'submitted']),
            'compensation' => in_array($stepStatuses['compensation'], ['in_progress', 'submitted']),
        ];

        $ceoPhilosophyStatus = $hrProject->ceoPhilosophy ? 'submitted' : 'not_started';
        
        // Get pending verifications
        $pendingVerifications = [];
        $stepNames = [
            'diagnosis' => 'Diagnosis – Step 1',
            'organization' => 'Organization Design – Step 2',
            'performance' => 'Performance System – Step 3',
            'compensation' => 'Compensation System – Step 4',
        ];
        
        foreach ($stepStatuses as $stepKey => $status) {
            if ($status === 'submitted') {
                $stepOrder = ['diagnosis' => 'organization', 'organization' => 'performance', 'performance' => 'compensation'];
                $nextStep = $stepOrder[$stepKey] ?? null;
                
                if ($nextStep) {
                    $nextStepStatus = $stepStatuses[$nextStep] ?? 'not_started';
                    if ($nextStepStatus === 'not_started') {
                        $pendingVerifications[] = [
                            'step' => $stepKey,
                            'stepName' => $stepNames[$stepKey] ?? $stepKey,
                            'projectId' => $hrProject->id,
                        ];
                    }
                }
            }
        }

        $allStepsComplete = collect($stepsStatus)->every(fn($status) => $status === true);

        // Render dashboard without page refresh
        return Inertia::render('CEO/Dashboard/Index', [
            'company' => $companies->first(),
            'project' => $hrProject,
            'ceoPhilosophyStatus' => $ceoPhilosophyStatus,
            'stepsStatus' => $stepsStatus,
            'stepStatuses' => $stepStatuses,
            'pendingVerifications' => $pendingVerifications,
            'allStepsComplete' => $allStepsComplete,
            'flash' => [
                'success' => "Step verified successfully! The next step has been unlocked for the HR Manager.",
                'nextStep' => $nextStepName,
                'nextStepRoute' => $nextStepRoute,
            ],
        ]);
    }
}
