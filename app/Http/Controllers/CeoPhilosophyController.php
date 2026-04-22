<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\CeoPhilosophy;
use App\Models\DiagnosisQuestion;
use App\Models\HrProject;
use App\Models\HrIssue;
use App\Notifications\PhilosophyCompletedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class CeoPhilosophyController extends Controller
{
    /**
     * Show philosophy survey page.
     */
    public function showSurvey(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('ceo')) {
            abort(403);
        }

        // Check if CEO is associated with the company
        if (!$hrProject->company->users->contains($request->user())) {
            abort(403);
        }

        // Load company relationship
        $hrProject->load('company');
        
        // Check if diagnosis is submitted - survey should be accessible when diagnosis is submitted
        $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
        if (!$diagnosisStatus || !in_array($diagnosisStatus->value, ['submitted', 'approved', 'locked'])) {
            return redirect()->route('ceo.dashboard')
                ->with('error', 'Please wait for HR Manager to submit the diagnosis before completing the survey.');
        }

        // Load questions by category
        $managementPhilosophyQuestions = DiagnosisQuestion::where('category', 'management_philosophy')
            ->where('is_active', true)
            ->orderBy('order')
            ->get()
            ->shuffle(); // Shuffle for each CEO

        $visionMissionQuestions = DiagnosisQuestion::where('category', 'vision_mission')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        $growthStageQuestion = DiagnosisQuestion::where('category', 'growth_stage')
            ->where('is_active', true)
            ->first();

        $leadershipQuestions = DiagnosisQuestion::where('category', 'leadership')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        $generalQuestions = DiagnosisQuestion::where('category', 'general')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        $concernsQuestion = DiagnosisQuestion::where('category', 'concerns')
            ->where('is_active', true)
            ->first();

        $issuesQuestion = DiagnosisQuestion::where('category', 'issues')
            ->where('is_active', true)
            ->first();

        // Load HR-identified issues for CEO to select from
        $hrIssues = HrIssue::where('is_active', true)
            ->orderBy('category')
            ->orderBy('order')
            ->get();

        // Load intro text
        $introText = \App\Models\IntroText::where('key', 'ceo_survey_intro')
            ->where('is_active', true)
            ->first();

        $philosophy = $hrProject->ceoPhilosophy;
        // After validation errors, Laravel flashes old input; pass it so the form can rehydrate
        $surveyOldInput = $request->session()->get('_old_input', []);

        return Inertia::render('CEO/Philosophy/Survey', [
            'project' => $hrProject,
            'philosophy' => $philosophy,
            'surveyOldInput' => $surveyOldInput,
            'managementPhilosophyQuestions' => $managementPhilosophyQuestions,
            'visionMissionQuestions' => $visionMissionQuestions,
            'growthStageQuestion' => $growthStageQuestion,
            'leadershipQuestions' => $leadershipQuestions,
            'generalQuestions' => $generalQuestions,
            'concernsQuestion' => $concernsQuestion,
            'issuesQuestion' => $issuesQuestion,
            'hrIssues' => $hrIssues,
            'introText' => $introText,
            'diagnosis' => $hrProject->diagnosis,
        ]);
    }

    /**
     * Store philosophy survey responses.
     */
    public function store(Request $request, HrProject $hrProject)
    {
        $existingPhilosophy = CeoPhilosophy::where('hr_project_id', $hrProject->id)
            ->where('user_id', $request->user()->id)
            ->first();
        $alreadyCompleted = (bool) ($existingPhilosophy?->completed_at);

        $validated = $request->validate([
            'management_philosophy' => ['required', 'array'],
            'vision_mission' => ['required', 'array'],
            'growth_stage' => ['required', 'string'],
            'leadership' => ['required', 'array'],
            'general' => ['required', 'array'],
            'organizational_issues' => ['required', 'array', 'min:1'],
            'organizational_issues_other' => ['nullable', 'string'],
            'concerns' => ['required', 'string'],
        ]);

        $ceoPhilosophy = CeoPhilosophy::updateOrCreate(
            [
                'hr_project_id' => $hrProject->id,
                'user_id' => $request->user()->id,
            ],
            [
                'management_philosophy_responses' => $validated['management_philosophy'],
                'vision_mission_responses' => $validated['vision_mission'],
                'growth_stage' => $validated['growth_stage'],
                'leadership_responses' => $validated['leadership'],
                'general_responses' => $validated['general'],
                'organizational_issues' => $validated['organizational_issues'] ?? [],
                'concerns' => $validated['concerns'],
                'completed_at' => now(),
            ]
        );

        // CEO completed survey: verify/lock diagnosis and unlock next workflow step.
        $currentDiagnosisStatus = $hrProject->getStepStatus('diagnosis');
        if (!$currentDiagnosisStatus || in_array($currentDiagnosisStatus, [StepStatus::IN_PROGRESS, StepStatus::SUBMITTED, StepStatus::APPROVED], true)) {
            $hrProject->setStepStatus('diagnosis', StepStatus::LOCKED);
        }
        if (! $hrProject->getStepStatus('job_analysis') || $hrProject->getStepStatus('job_analysis') === StepStatus::NOT_STARTED) {
            $hrProject->setStepStatus('job_analysis', StepStatus::IN_PROGRESS);
        }

        // Notify HR managers only on first completion (avoid repeated emails).
        if (! $alreadyCompleted) {
            $hrManagers = $hrProject->company->users()
                ->wherePivot('role', 'hr_manager')
                ->get();
            if ($hrManagers->isNotEmpty()) {
                Notification::send($hrManagers, new PhilosophyCompletedNotification($hrProject));
            }
        }

        $redirect = redirect()->route('ceo.projects.verification', $hrProject)
            ->with('success', 'Survey completed successfully.');

        if (! $alreadyCompleted) {
            $redirect->with('ceoSurveyDone', true);
        }

        return $redirect;
    }
}
