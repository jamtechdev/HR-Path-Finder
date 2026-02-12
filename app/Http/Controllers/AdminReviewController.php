<?php

namespace App\Http\Controllers;

use App\Models\AdminComment;
use App\Models\HrProject;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    /**
     * Show admin review page.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('admin')) {
            abort(403);
        }

        $hrProject->load([
            'diagnosis',
            'ceoPhilosophy',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'hrPolicyOs',
            'adminComments',
            'company',
        ]);

        return \Inertia\Inertia::render('Admin/Review/Index', [
            'project' => $hrProject,
            'comments' => $hrProject->adminComments,
        ]);
    }

    /**
     * Add admin comment.
     */
    public function addComment(Request $request, HrProject $hrProject)
    {
        if (!$request->user()->hasRole('admin')) {
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
