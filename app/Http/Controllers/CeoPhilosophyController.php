<?php

namespace App\Http\Controllers;

use App\Models\CeoPhilosophy;
use App\Models\HrProject;
use App\Models\HrProjectAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CeoPhilosophyController extends Controller
{
    /**
     * Format project data for Inertia response
     */
    private function formatProjectData(HrProject $hrProject): array
    {
        return [
            'id' => $hrProject->id,
            'current_step' => $hrProject->current_step,
            'status' => $hrProject->status,
            'company' => $hrProject->company ? [
                'id' => $hrProject->company->id,
                'name' => $hrProject->company->name,
                'industry' => $hrProject->company->industry,
                'hr_issues' => $hrProject->company->hrIssues ? $hrProject->company->hrIssues->map(function($issue) {
                    return [
                        'id' => $issue->id,
                        'issue_type' => $issue->issue_type,
                        'is_custom' => $issue->is_custom,
                        'description' => $issue->description,
                    ];
                })->toArray() : [],
            ] : null,
            'ceo_philosophy' => $hrProject->ceoPhilosophy ? [
                'id' => $hrProject->ceoPhilosophy->id,
                'responses' => $hrProject->ceoPhilosophy->responses,
                'main_trait' => $hrProject->ceoPhilosophy->main_trait,
                'sub_trait' => $hrProject->ceoPhilosophy->sub_trait,
                'completed_at' => $hrProject->ceoPhilosophy->completed_at?->toISOString(),
            ] : null,
        ];
    }

    /**
     * Show all projects that need CEO philosophy survey
     */
    public function index(): Response
    {
        if (!Auth::user()->hasRole('ceo')) {
            abort(403);
        }

        $user = Auth::user();
        
        // Get all companies where user is CEO
        $companies = $user->companies()->wherePivot('role', 'ceo')->get();
        $companyIds = $companies->pluck('id')->toArray();
        
        // Get all HR projects - we'll filter and auto-attach as needed
        $allProjects = HrProject::with([
            'company' => function($query) {
                $query->with(['users' => function($q) {
                    $q->wherePivot('role', 'hr_manager');
                }]);
            },
            'ceoPhilosophy',
        ])->latest()->get();
        
        // Process projects: auto-attach CEO if diagnosis is submitted, and collect all relevant projects
        $projects = $allProjects->map(function($project) use ($user, $companyIds) {
            $project->initializeStepStatuses();
            $project->refresh();
            
            $diagnosisStatus = $project->getStepStatus('diagnosis');
            
            // Auto-attach CEO if diagnosis is submitted and CEO not already attached
            if ($diagnosisStatus === 'submitted' && !in_array($project->company_id, $companyIds)) {
                $project->company->users()->syncWithoutDetaching([
                    $user->id => ['role' => 'ceo']
                ]);
            }
            
            // Only include projects where CEO is attached OR diagnosis is submitted
            $isCeoAttached = in_array($project->company_id, $companyIds);
            if (!$isCeoAttached && $diagnosisStatus !== 'submitted') {
                return null; // Skip projects that don't need CEO attention
            }
            
            $hrManager = $project->company->users->first();
            
            // Check CEO Philosophy Survey status
            $ceoPhilosophyStatus = 'not_started';
            if ($project->ceoPhilosophy) {
                $ceoPhilosophyStatus = $project->ceoPhilosophy->completed_at ? 'completed' : 'in_progress';
            } elseif ($diagnosisStatus === 'submitted') {
                $ceoPhilosophyStatus = 'not_started';
            } else {
                $ceoPhilosophyStatus = 'locked';
            }
            
            return [
                'id' => $project->id,
                'company_id' => $project->company_id,
                'company_name' => $project->company->name,
                'company_industry' => $project->company->industry,
                'hr_manager_id' => $hrManager?->id,
                'hr_manager_name' => $hrManager?->name,
                'hr_manager_email' => $hrManager?->email,
                'diagnosis_status' => $diagnosisStatus,
                'ceo_philosophy_status' => $ceoPhilosophyStatus,
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
            ];
        })
        ->filter() // Remove null entries
        ->values();

        return Inertia::render('CEO/PhilosophySurvey/Index', [
            'projects' => $projects,
        ]);
    }

    public function show(HrProject $hrProject): Response
    {
        // Only CEO can access
        if (!Auth::user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO has access to this project's company
        $user = Auth::user();
        $userCompanies = $user->companies()->wherePivot('role', 'ceo')->pluck('companies.id');
        
        // Allow access if CEO is attached to company OR if diagnosis is submitted (CEO might not be attached yet)
        if (!$userCompanies->contains($hrProject->company_id)) {
            // Check if diagnosis is submitted - if yes, allow CEO to access
            $hrProject->initializeStepStatuses();
            $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
            
            if ($diagnosisStatus !== 'submitted') {
                abort(403, 'You do not have access to this project.');
            }
            
            // Auto-attach CEO to company if diagnosis is submitted
            $hrProject->company->users()->syncWithoutDetaching([
                $user->id => ['role' => 'ceo']
            ]);
        }

        // For onboarding flow: CEO can complete survey immediately after joining (if attached to company)
        // OR after diagnosis is submitted (for cases where CEO wasn't invited initially)
        $hrProject->initializeStepStatuses();
        $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
        $isCeoAttached = $userCompanies->contains($hrProject->company_id);
        
        // Allow access if CEO is attached to company (onboarding flow) OR diagnosis is submitted
        if (!$isCeoAttached && $diagnosisStatus !== 'submitted') {
            return redirect()->route('ceo.philosophy-survey')->withErrors([
                'message' => 'Please wait for the HR Manager to complete and submit Step 1: Diagnosis before starting the Management Philosophy Survey.',
            ]);
        }

        $hrProject->load([
            'ceoPhilosophy',
            'company.hrIssues',
            'companyAttributes',
            'organizationalSentiment',
            'businessProfile',
            'workforce',
            'currentHrStatus',
            'culture',
        ]);

        return Inertia::render('hr-projects/diagnosis/ceo-philosophy', [
            'project' => $this->formatProjectData($hrProject),
            'allowCompanyReview' => true, // Allow CEO to review company info before survey
        ]);
    }

    public function update(Request $request, HrProject $hrProject)
    {
        // Only CEO can access
        if (!Auth::user()->hasRole('ceo')) {
            abort(403);
        }

        // Check access - allow if CEO is attached OR diagnosis is submitted
        $user = Auth::user();
        $userCompanies = $user->companies()->wherePivot('role', 'ceo')->pluck('companies.id');
        
        if (!$userCompanies->contains($hrProject->company_id)) {
            // Check if diagnosis is submitted - if yes, allow CEO to access
            $hrProject->initializeStepStatuses();
            $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
            
            if ($diagnosisStatus !== 'submitted') {
                abort(403, 'You do not have access to this project.');
            }
            
            // Auto-attach CEO to company if diagnosis is submitted
            $hrProject->company->users()->syncWithoutDetaching([
                $user->id => ['role' => 'ceo']
            ]);
        }

        $validated = $request->validate([
            'responses' => 'required|array',
            'responses.*' => 'nullable', // Allow various types (string, number, array)
            'main_trait' => 'nullable|string',
            'sub_trait' => 'nullable|string',
        ]);

        DB::transaction(function () use ($hrProject, $validated) {
            $philosophy = $hrProject->ceoPhilosophy()->updateOrCreate(
                ['hr_project_id' => $hrProject->id],
                [
                    'user_id' => Auth::id(),
                    'responses' => $validated['responses'],
                    'main_trait' => $validated['main_trait'],
                    'sub_trait' => $validated['sub_trait'] ?? null,
                ]
            );

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'ceo_philosophy_updated',
                'step' => 'ceo_philosophy',
                'new_data' => $validated,
            ]);
        });

        // Reload project data and render without page refresh
        $hrProject->refresh();
        $hrProject->load(['ceoPhilosophy', 'company.hrIssues', 'companyAttributes', 'organizationalSentiment', 'businessProfile', 'workforce', 'currentHrStatus', 'culture']);

        return Inertia::render('hr-projects/diagnosis/ceo-philosophy', [
            'project' => $this->formatProjectData($hrProject),
            'allowCompanyReview' => true,
        ]);
    }

    public function submit(Request $request, HrProject $hrProject)
    {
        // Only CEO can access
        if (!Auth::user()->hasRole('ceo')) {
            abort(403);
        }

        // Check access - allow if CEO is attached OR diagnosis is submitted
        $user = Auth::user();
        $userCompanies = $user->companies()->wherePivot('role', 'ceo')->pluck('companies.id');
        
        if (!$userCompanies->contains($hrProject->company_id)) {
            // Check if diagnosis is submitted - if yes, allow CEO to access
            $hrProject->initializeStepStatuses();
            $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
            
            if ($diagnosisStatus !== 'submitted') {
                abort(403, 'You do not have access to this project.');
            }
            
            // Auto-attach CEO to company if diagnosis is submitted
            $hrProject->company->users()->syncWithoutDetaching([
                $user->id => ['role' => 'ceo']
            ]);
        }

        $philosophy = $hrProject->ceoPhilosophy;
        if (!$philosophy) {
            return redirect()->back()->withErrors(['message' => 'Please complete the philosophy survey first.']);
        }

        DB::transaction(function () use ($philosophy, $hrProject) {
            // Mark philosophy as completed
            $philosophy->update(['completed_at' => now()]);

            // Verify diagnosis step - CEO survey completion verifies diagnosis
            $hrProject->initializeStepStatuses();
            $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
            
            // CEO survey completion automatically verifies Step 1: Diagnosis
            // Always mark diagnosis as 'completed' (verified by CEO) to unlock Step 2: Organization Design
            // This ensures Step 1 is verified when CEO completes the survey
            $hrProject->setStepStatus('diagnosis', 'completed');
            
            // Ensure Organization Design step is unlocked (set to 'not_started' if it's locked)
            $organizationStatus = $hrProject->getStepStatus('organization');
            if ($organizationStatus === 'locked' || $organizationStatus === 'not_started') {
                $hrProject->setStepStatus('organization', 'not_started');
            }
            
            // Update current_step to organization
            $hrProject->update([
                'current_step' => 'organization',
            ]);

            HrProjectAudit::create([
                'hr_project_id' => $hrProject->id,
                'user_id' => Auth::id(),
                'action' => 'ceo_philosophy_submitted',
                'step' => 'ceo_philosophy',
                'new_data' => [
                    'diagnosis_verified' => true,
                    'step_2_unlocked' => true,
                ],
            ]);
        });

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
        
        foreach ($stepStatuses as $step => $status) {
            if ($status === 'submitted') {
                $stepOrder = ['diagnosis' => 'organization', 'organization' => 'performance', 'performance' => 'compensation'];
                $nextStep = $stepOrder[$step] ?? null;
                
                if ($nextStep) {
                    $nextStepStatus = $stepStatuses[$nextStep] ?? 'not_started';
                    if ($nextStepStatus === 'not_started') {
                        $pendingVerifications[] = [
                            'step' => $step,
                            'stepName' => $stepNames[$step] ?? $step,
                            'projectId' => $hrProject->id,
                        ];
                    }
                }
            }
        }

        // After survey completion, redirect CEO to diagnosis workspace (same as HR manager sees)
        // This shows the same diagnosis data that HR manager filled
        return redirect()->route('hr-manager.diagnosis.tab.with-project', [
            'projectId' => $hrProject->id,
            'tab' => 'overview'
        ])->with('success', 'Management Philosophy Survey completed successfully! Step 1: Diagnosis has been verified and Step 2: Organization Design has been unlocked for the HR Manager.');
    }
}
