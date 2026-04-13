<?php

namespace App\Http\Controllers;

use App\Models\AdminComment;
use App\Models\HrProject;
use App\Models\ReportUpload;
use App\Services\ReportDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HrReportController extends Controller
{
    protected ReportDataService $reportDataService;

    public function __construct(ReportDataService $reportDataService)
    {
        $this->reportDataService = $reportDataService;
    }

    /**
     * Show report page for HR Manager.
     */
    public function index(Request $request, HrProject $hrProject)
    {
        $user = $request->user();
        
        // Only allow HR Manager
        if (!$user->hasRole('hr_manager')) {
            abort(403);
        }

        $data = $this->reportDataService->getComprehensiveProjectData($hrProject);

        $reportUploads = ReportUpload::where('hr_project_id', $hrProject->id)
            ->orderByDesc('created_at')
            ->get();
        $adminComment = AdminComment::query()
            ->where('hr_project_id', $hrProject->id)
            ->whereNotNull('comment')
            ->where('comment', '!=', '')
            ->with('user:id,name')
            ->latest('updated_at')
            ->first();

        return Inertia::render('HRManager/Report/Index', [
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
     * Upload a report file (e.g. final PDF) for this project.
     */
    public function upload(Request $request, HrProject $hrProject)
    {
        $user = $request->user();
        if (!$user->hasRole('hr_manager')) {
            abort(403);
        }

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:51200'],
        ]);

        $file = $request->file('file');
        $dir = 'report_uploads/' . $hrProject->id;
        $path = $file->store($dir, 'local');

        ReportUpload::create([
            'hr_project_id' => $hrProject->id,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => $user->id,
        ]);

        return back()->with('success', 'Report uploaded successfully.');
    }

    /**
     * Download an uploaded report file.
     */
    public function downloadUpload(Request $request, HrProject $hrProject, ReportUpload $reportUpload)
    {
        $user = $request->user();
        if (!$user->hasRole('hr_manager')) {
            abort(403);
        }
        if ($reportUpload->hr_project_id !== $hrProject->id) {
            abort(404);
        }

        if (!Storage::disk('local')->exists($reportUpload->file_path)) {
            return back()->withErrors(['error' => 'File not found.']);
        }

        return Storage::disk('local')->download(
            $reportUpload->file_path,
            $reportUpload->original_name,
            ['Content-Type' => $reportUpload->mime_type ?? 'application/pdf']
        );
    }

    /**
     * Download full report PDF.
     */
    public function downloadFullReport(Request $request, HrProject $hrProject)
    {
        $user = $request->user();
        
        if (!$user->hasRole('hr_manager')) {
            abort(403);
        }

        // Only allow full report generation once all main steps are completed/submitted.
        $readyStatuses = ['submitted', 'approved', 'locked', 'completed'];
        $statuses = $hrProject->step_statuses ?? [];
        $requiredSteps = ['diagnosis', 'job_analysis', 'performance', 'compensation'];
        $allDone = collect($requiredSteps)->every(function ($step) use ($statuses, $readyStatuses) {
            $s = $statuses[$step] ?? 'not_started';
            return in_array($s, $readyStatuses, true);
        });
        if (!$allDone) {
            abort(409, 'Full report is available after completing all steps (Diagnosis, Job Analysis, Performance, Compensation).');
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
        
        if (!$user->hasRole('hr_manager')) {
            abort(403);
        }

        $readyStatuses = ['submitted', 'approved', 'locked', 'completed'];
        $statuses = $hrProject->step_statuses ?? [];
        $status = $statuses[$step] ?? 'not_started';
        if (!in_array($status, $readyStatuses, true)) {
            abort(409, 'This step report is available after the step is completed/submitted.');
        }

        $pdfService = app(\App\Services\PdfReportService::class);
        $pdfContent = $pdfService->generateStepReport($hrProject, $step);

        $stepNames = [
            'diagnosis' => 'Diagnosis',
            'job_analysis' => 'Job_Analysis',
            'performance' => 'Performance',
            'compensation' => 'Compensation',
            'hr_policy_os' => 'Final_Dashboard',
        ];

        $stepName = $stepNames[$step] ?? $step;
        $filename = $stepName . '_Report_' . $hrProject->company->name . '_' . date('Y-m-d') . '.pdf';
        $filename = preg_replace('/[^A-Za-z0-9_\-]/', '_', $filename);

        return response($pdfContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
