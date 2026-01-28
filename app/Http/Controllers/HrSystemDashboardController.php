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

        // Initialize step statuses to ensure they're set
        $hrProject->initializeStepStatuses();
        $hrProject->refresh();
        
        // Aggregate all step data for the dashboard
        $projectData = [
            'id' => $hrProject->id,
            'status' => $hrProject->status,
            'company' => $hrProject->company ? [
                'id' => $hrProject->company->id,
                'name' => $hrProject->company->name,
                'logo_path' => $hrProject->company->logo_path,
            ] : null,
            'company_attributes' => $hrProject->companyAttributes,
            'organizational_sentiment' => $hrProject->organizationalSentiment,
            'ceo_philosophy' => $hrProject->ceoPhilosophy ? [
                'main_trait' => $hrProject->ceoPhilosophy->main_trait,
                'sub_trait' => $hrProject->ceoPhilosophy->sub_trait,
            ] : null,
            'organization_design' => $hrProject->organizationDesign ? [
                'structure_type' => $hrProject->organizationDesign->structure_type,
                'job_grade_structure' => $hrProject->organizationDesign->job_grade_structure,
                'grade_title_relationship' => $hrProject->organizationDesign->grade_title_relationship,
            ] : null,
            'performance_system' => $hrProject->performanceSystem ? [
                'performance_method' => $hrProject->performanceSystem->performance_method,
                'performance_unit' => $hrProject->performanceSystem->performance_unit,
            ] : null,
            'compensation_system' => $hrProject->compensationSystem ? [
                'compensation_structure' => $hrProject->compensationSystem->compensation_structure,
                'differentiation_method' => $hrProject->compensationSystem->differentiation_method,
            ] : null,
        ];

        return Inertia::render('hr-projects/dashboard', [
            'project' => $projectData,
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
