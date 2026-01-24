<?php

namespace App\Http\Controllers;

use App\Models\HrProject;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HrSystemDashboardController extends Controller
{
    public function show(HrProject $hrProject): Response
    {
        $this->authorize('view', $hrProject->company);

        $hrProject->load([
            'company',
            'companyAttributes',
            'organizationalSentiment',
            'ceoPhilosophy',
            'organizationDesign',
            'performanceSystem',
            'compensationSystem',
            'consultantReviews',
            'ceoApprovals',
        ]);

        // Calculate CEO alignment score (simplified)
        $alignmentScore = $this->calculateAlignmentScore($hrProject);

        return Inertia::render('hr-projects/dashboard', [
            'project' => $hrProject,
            'alignmentScore' => $alignmentScore,
        ]);
    }

    protected function calculateAlignmentScore(HrProject $hrProject): string
    {
        // Simplified alignment calculation
        // In a real implementation, this would be more sophisticated
        if (!$hrProject->ceoPhilosophy || !$hrProject->organizationDesign) {
            return 'Low';
        }

        // Basic logic: if philosophy and design align, score is higher
        $score = 0;
        $maxScore = 4;

        // Check various alignments
        if ($hrProject->ceoPhilosophy->main_trait === 'autocratic' && 
            in_array($hrProject->organizationDesign->structure_type, ['functional', 'divisional'])) {
            $score++;
        }

        if ($hrProject->performanceSystem && $hrProject->compensationSystem) {
            $score++;
        }

        if ($hrProject->consultantReviews()->exists()) {
            $score++;
        }

        if ($hrProject->ceoApprovals()->where('status', 'approved')->exists()) {
            $score++;
        }

        $percentage = ($score / $maxScore) * 100;

        if ($percentage >= 75) {
            return 'High';
        } elseif ($percentage >= 50) {
            return 'Medium';
        }

        return 'Low';
    }
}
