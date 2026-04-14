<?php

namespace App\Http\Controllers;

use App\Models\CompensationSnapshotQuestion;
use App\Models\HrProject;
use Illuminate\Http\Request;

class HrSystemOverviewController extends Controller
{
    /**
     * Show HR System overview dashboard.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        // Check authorization
        $company = $hrProject->company;
        if (!$company->users->contains($request->user()) && !$request->user()->hasRole('admin')) {
            abort(403);
        }

        $hrProject->load([
            'diagnosis',
            'ceoPhilosophy',
            'companyAttributes',
            'organizationalSentiment',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'adminComments',
            'company',
            'compensationSnapshotResponses.question',
        ]);

        $compensationSnapshotQuestions = CompensationSnapshotQuestion::query()
            ->where('is_active', true)
            ->orderBy('order')
            ->orderBy('id')
            ->get(['id', 'order', 'question_text', 'answer_type', 'metadata']);

        $snapshotResponsesByQuestionId = $hrProject->compensationSnapshotResponses
            ->keyBy('question_id');

        $compensationSnapshotDetails = $compensationSnapshotQuestions->map(
            function (CompensationSnapshotQuestion $question) use ($snapshotResponsesByQuestionId): array {
                $response = $snapshotResponsesByQuestionId->get($question->id);

                return [
                    'id' => $question->id,
                    'order' => (int) $question->order,
                    'question_text' => (string) ($question->question_text ?? ''),
                    'answer_type' => (string) ($question->answer_type ?? ''),
                    'metadata' => is_array($question->metadata) ? $question->metadata : null,
                    'response' => $response ? [
                        'response' => $response->response,
                        'text_response' => $response->text_response,
                        'numeric_response' => $response->numeric_response !== null ? (float) $response->numeric_response : null,
                        'updated_at' => optional($response->updated_at)?->toDateTimeString(),
                    ] : null,
                ];
            }
        )->values();

        // Build comprehensive HR system object
        $hrSystem = [
            'project' => $hrProject,
            'company' => $hrProject->company,
            'management_philosophy' => [
                'main_trait' => $hrProject->ceoPhilosophy?->main_trait,
                'secondary_trait' => $hrProject->ceoPhilosophy?->secondary_trait,
            ],
            'organization_structure' => [
                'structure_type' => $hrProject->organizationDesign?->structure_type,
                'job_grade_structure' => $hrProject->organizationDesign?->job_grade_structure,
            ],
            'performance_system' => [
                'evaluation_unit' => $hrProject->performanceSystem?->evaluation_unit,
                'performance_method' => $hrProject->performanceSystem?->performance_method,
                'evaluation_logic' => $hrProject->performanceSystem?->evaluation_logic,
            ],
            'compensation_system' => [
                'compensation_structure' => $hrProject->compensationSystem?->compensation_structure,
                'incentive_types' => $hrProject->compensationSystem?->incentive_types,
            ],
            'is_locked' => $hrProject->isFullyLocked(),
            'step_statuses' => $hrProject->step_statuses,
            'compensation_snapshot_details' => $compensationSnapshotDetails,
        ];

        return \Inertia\Inertia::render('HRSystem/Overview', [
            'hrSystem' => $hrSystem,
        ]);
    }
}
