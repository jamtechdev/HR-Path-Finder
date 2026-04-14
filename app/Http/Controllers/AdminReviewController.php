<?php

namespace App\Http\Controllers;

use App\Models\AdminComment;
use App\Models\HrProject;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
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
