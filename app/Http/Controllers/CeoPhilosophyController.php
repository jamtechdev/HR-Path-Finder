<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Models\CeoPhilosophy;
use App\Models\DiagnosisQuestion;
use App\Models\HrProject;
use App\Models\HrIssue;
use Illuminate\Http\Request;
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
            'hrIssues' => $hrIssues,
            'introText' => $introText,
            'diagnosis' => $hrProject->diagnosis,
        ]);
    }

    /**
     * Store philosophy survey responses.
     * On autosave, only management_philosophy and growth_stage are required; other sections can be empty.
     */
    public function store(Request $request, HrProject $hrProject)
    {
        $isAutosave = $request->boolean('autosave');
        $validated = $request->validate([
            'management_philosophy' => ['required', 'array'],
            'vision_mission' => [$isAutosave ? 'nullable' : 'required', 'array'],
            'growth_stage' => ['nullable', 'string'],
            'leadership' => [$isAutosave ? 'nullable' : 'required', 'array'],
            'general' => [$isAutosave ? 'nullable' : 'required', 'array'],
            'organizational_issues' => ['nullable', 'array'],
            'organizational_issues_other' => ['nullable', 'string'],
            'concerns' => ['nullable', 'string'],
        ]);
        $validated['vision_mission'] = $validated['vision_mission'] ?? [];
        $validated['leadership'] = $validated['leadership'] ?? [];
        $validated['general'] = $validated['general'] ?? [];
        $validated['growth_stage'] = $validated['growth_stage'] ?? '';
        $validated['concerns'] = $validated['concerns'] ?? '';
        $validated['organizational_issues'] = $validated['organizational_issues'] ?? [];

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

        // Auto-save: stay on survey page so user can continue. Final submit: redirect to dashboard and mark diagnosis complete.
        if ($request->boolean('autosave')) {
            return redirect()->back()->with('saved', true);
        }

        // Mark diagnosis step as completed after CEO survey is done (final submit only)
        $diagnosisStatus = $hrProject->getStepStatus('diagnosis');
        if ($diagnosisStatus && $diagnosisStatus->value === 'submitted') {
            $hrProject->setStepStatus('diagnosis', StepStatus::APPROVED);
        }

        return redirect()->route('ceo.dashboard')
            ->with('success', 'Management Philosophy Survey completed successfully. Step 1: Diagnosis is now complete.');
    }
}
