<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\HrProject;
use App\Models\ConsultantReview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultantDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get projects assigned for consultant review
        $assignedProjects = HrProject::where('status', 'pending_consultant_review')
            ->with(['company', 'consultantReview'])
            ->get();
            
        // Get completed reviews by this consultant
        $completedReviews = ConsultantReview::where('consultant_id', $user->id)
            ->with(['hrProject.company'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Dashboard/Consultant/Index', [
            'assignedProjects' => $assignedProjects,
            'completedReviews' => $completedReviews,
            'stats' => [
                'pending_reviews' => $assignedProjects->count(),
                'completed_reviews' => $completedReviews->count(),
            ]
        ]);
    }

    public function reviews()
    {
        $user = auth()->user();
        
        $pendingReviews = HrProject::where('status', 'pending_consultant_review')
            ->with(['company', 'ceoPhilosophy', 'organizationDesign', 'performanceSystem', 'compensationSystem'])
            ->paginate(10);

        return Inertia::render('Dashboard/Consultant/Reviews', [
            'pendingReviews' => $pendingReviews
        ]);
    }
}