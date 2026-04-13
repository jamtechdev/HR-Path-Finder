<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminComment;
use App\Models\HrProject;
use App\Models\ReportUpload;
use App\Services\ReportDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    protected ReportDataService $reportDataService;

    public function __construct(ReportDataService $reportDataService)
    {
        $this->reportDataService = $reportDataService;
    }

    /**
     * Show report page for Admin.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        $user = $request->user();
        
        // Only allow Admin
        if (!$user->hasRole('admin')) {
            abort(403);
        }

        $data = $this->reportDataService->getComprehensiveProjectData($hrProject);
        $reportUploads = ReportUpload::query()
            ->where('hr_project_id', $hrProject->id)
            ->latest()
            ->get(['id', 'original_name', 'created_at']);
        $adminComment = AdminComment::query()
            ->where('hr_project_id', $hrProject->id)
            ->whereNotNull('comment')
            ->where('comment', '!=', '')
            ->with('user:id,name')
            ->latest('updated_at')
            ->first();

        return Inertia::render('Admin/Report/Index', [
            'project' => $data['project'],
            'stepStatuses' => $data['stepStatuses'],
            'projectId' => $hrProject->id,
            'hrSystemSnapshot' => $data['hrSystemSnapshot'],
            'reportUploads' => $reportUploads,
            'adminComment' => $adminComment ? [
                'comment' => $adminComment->comment,
                'author' => $adminComment->user?->name,
                'updated_at' => optional($adminComment->updated_at)->toIso8601String(),
            ] : null,
        ]);
    }

    /**
     * Download full report PDF.
     */
    public function downloadFullReport(Request $request, HrProject $hrProject)
    {
        $user = $request->user();
        
        if (!$user->hasRole('admin')) {
            abort(403);
        }

        $pdfService = app(\App\Services\PdfReportService::class);
        $pdfContent = $pdfService->generateFullReport($hrProject);

        $filename = 'HR_Report_' . $hrProject->company->name . '_' . date('Y-m-d') . '.pdf';
        $filename = preg_replace('/[^A-Za-z0-9_\-]/', '_', $filename);

        return response($pdfContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Download step-specific report PDF.
     */
    public function downloadStepReport(Request $request, HrProject $hrProject, string $step)
    {
        $user = $request->user();
        
        if (!$user->hasRole('admin')) {
            abort(403);
        }

        $pdfService = app(\App\Services\PdfReportService::class);
        $pdfContent = $pdfService->generateStepReport($hrProject, $step);

        $stepNames = [
            'diagnosis' => 'Diagnosis',
            'job_analysis' => 'Job_Analysis',
            'performance' => 'Performance',
            'compensation' => 'Compensation',
            'hr_policy_os' => 'HR_Policy_OS',
        ];

        $stepName = $stepNames[$step] ?? $step;
        $filename = $stepName . '_Report_' . $hrProject->company->name . '_' . date('Y-m-d') . '.pdf';
        $filename = preg_replace('/[^A-Za-z0-9_\-]/', '_', $filename);

        return response($pdfContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Download uploaded consultant report.
     */
    public function downloadUploadedReport(Request $request, HrProject $hrProject, ReportUpload $reportUpload)
    {
        $user = $request->user();

        if (!$user->hasRole('admin')) {
            abort(403);
        }

        if ((int) $reportUpload->hr_project_id !== (int) $hrProject->id) {
            abort(404);
        }

        return response()->download(
            storage_path('app/public/' . $reportUpload->file_path),
            $reportUpload->original_name
        );
    }
}
