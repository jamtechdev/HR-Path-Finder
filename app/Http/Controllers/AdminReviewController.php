<?php

namespace App\Http\Controllers;

use App\Models\AdminComment;
use App\Models\CompensationSnapshotQuestion;
use App\Models\HrProject;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    /**
     * Dedicated C&B snapshot review page.
     */
    public function cbSnapshotReview(Request $request, ?HrProject $hrProject = null)
    {
        if (! $request->user()->hasRole('admin')) {
            abort(403);
        }

        $projects = $this->projectsForReviewSidebar();
        $selected = $hrProject;

        if (! $selected) {
            $projectId = (int) $request->query('project_id', 0);
            if ($projectId > 0) {
                $selected = HrProject::find($projectId);
            }
            if (! $selected && $projects->count() > 0) {
                $selected = HrProject::find($projects->first()->id);
            }
        }

        $selectedPayload = $selected ? $this->buildSnapshotReviewPayload($selected) : null;

        return \Inertia\Inertia::render('Admin/Review/CBSnapshotReview', [
            'projects' => $projects,
            'selectedProject' => $selectedPayload,
        ]);
    }

    /**
     * Admin review landing: pick a project (no project payload yet).
     */
    public function list(Request $request)
    {
        if (! $request->user()->hasRole('admin')) {
            abort(403);
        }

        $projects = $this->projectsForReviewSidebar();

        return \Inertia\Inertia::render('Admin/Review/Index', [
            'project' => null,
            'projects' => $projects,
            'comments' => [],
            'stepData' => [],
        ]);
    }

    /**
     * Show admin review for a single project.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        if (! $request->user()->hasRole('admin')) {
            abort(403);
        }

        $hrProject->load([
            'diagnosis',
            'ceoPhilosophy',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'compensationSnapshotResponses.question',
            'hrPolicyOs',
            'adminComments',
            'company',
        ]);

        $projects = $this->projectsForReviewSidebar();

        return \Inertia\Inertia::render('Admin/Review/Index', [
            'project' => $hrProject,
            'projects' => $projects,
            'comments' => $hrProject->adminComments,
            'stepData' => [
                'diagnosis' => $hrProject->diagnosis,
                'ceo_philosophy' => $hrProject->ceoPhilosophy,
                'organization_design' => $hrProject->organizationDesign,
                'performance_system' => $hrProject->performanceSystem,
                'compensation_system' => $hrProject->compensationSystem,
                'compensation_snapshot_results' => $hrProject->compensationSnapshotResponses
                    ->sortBy(fn ($resp) => $resp->question?->order ?? PHP_INT_MAX)
                    ->values()
                    ->map(function ($resp) {
                        return [
                            'question_order' => $resp->question?->order,
                            'question_text' => $resp->question?->question_text,
                            'answer_type' => $resp->question?->answer_type,
                            'response' => $resp->response,
                            'text_response' => $resp->text_response,
                            'numeric_response' => $resp->numeric_response,
                            'updated_at' => optional($resp->updated_at)?->toDateTimeString(),
                        ];
                    }),
                'hr_policy_os' => $hrProject->hrPolicyOs,
            ],
        ]);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, HrProject>
     */
    private function projectsForReviewSidebar()
    {
        return HrProject::with('company')->orderByDesc('created_at')->get(['id', 'company_id', 'step_statuses', 'created_at']);
    }

    /**
     * Build per-project payload for C&B snapshot review.
     */
    private function buildSnapshotReviewPayload(HrProject $hrProject): array
    {
        $hrProject->load([
            'company',
            'diagnosis',
            'compensationSnapshotResponses.question',
        ]);

        $questions = CompensationSnapshotQuestion::query()
            ->where('is_active', true)
            ->orderBy('order')
            ->orderBy('id')
            ->get(['id', 'order', 'question_text', 'answer_type', 'metadata']);

        $responsesByQuestionId = $hrProject->compensationSnapshotResponses->keyBy('question_id');

        $snapshotRows = $questions->map(function (CompensationSnapshotQuestion $q) use ($responsesByQuestionId): array {
            $resp = $responsesByQuestionId->get($q->id);
            return [
                'question_id' => $q->id,
                'question_order' => $q->order,
                'question_text' => $q->question_text,
                'answer_type' => $q->answer_type,
                'metadata' => $q->metadata,
                'response' => $resp?->response,
                'text_response' => $resp?->text_response,
                'numeric_response' => $resp?->numeric_response !== null ? (float) $resp->numeric_response : null,
                'updated_at' => optional($resp?->updated_at)?->toDateTimeString(),
            ];
        })->values();

        $diagnosis = $hrProject->diagnosis;
        $headcount = (int) ($diagnosis?->present_headcount ?? 0);
        $fullTime = (int) ($diagnosis?->full_time_headcount ?? $headcount);
        $fullTimeRatio = $headcount > 0 ? round(($fullTime / $headcount) * 100) : null;

        return [
            'id' => $hrProject->id,
            'company_name' => $hrProject->company?->name ?? "Project #{$hrProject->id}",
            'status' => (string) ($hrProject->step_statuses['compensation'] ?? 'not_started'),
            'headcount' => [
                'total' => $headcount > 0 ? $headcount : null,
                'full_time_ratio' => $fullTimeRatio,
            ],
            'snapshot_rows' => $snapshotRows,
        ];
    }

    /**
     * Add admin comment.
     */
    public function addComment(Request $request, HrProject $hrProject)
    {
        // dd($request->comment, $request->step);
        if (! $request->user()->hasRole('admin')) {
            abort(403);
        }

        $request->validate([
            'step' => ['required', 'in:diagnosis,organization,performance,compensation,hr_policy_os'],
            'comment' => ['required', 'string', 'max:5000'],
        ]);

        AdminComment::create([
            'hr_project_id' => $hrProject->id,
            'user_id' => $request->user()->id,
            'step' => $request->step,
            'comment' => $request->comment,
        ]);

        return back()->with('success', 'Comment added successfully.');
    }
}
