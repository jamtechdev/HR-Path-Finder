<?php

namespace App\Services;

use App\Models\HrProject;
use Dompdf\Dompdf;
use Dompdf\Options;

class PdfReportService
{
    protected ReportDataService $reportDataService;

    public function __construct(ReportDataService $reportDataService)
    {
        $this->reportDataService = $reportDataService;
    }

    /**
     * Generate full project report PDF.
     */
    public function generateFullReport(HrProject $hrProject): string
    {
        $data = $this->reportDataService->getComprehensiveProjectData($hrProject);
        
        $html = $this->buildFullReportHtml($data);
        
        return $this->generatePdf($html);
    }

    /**
     * Generate step-specific report PDF.
     */
    public function generateStepReport(HrProject $hrProject, string $step): string
    {
        $data = $this->reportDataService->getComprehensiveProjectData($hrProject);
        
        $html = $this->buildStepReportHtml($data, $step);
        
        return $this->generatePdf($html);
    }

    /**
     * Safely convert value to string for HTML output.
     */
    private function formatValueForHtml($value): string
    {
        if (is_array($value)) {
            return htmlspecialchars(implode(', ', array_filter($value, fn($v) => $v !== null && $v !== '')));
        }
        if (is_bool($value)) {
            return $value ? 'Yes' : 'No';
        }
        if (is_null($value) || $value === '') {
            return '-';
        }
        return htmlspecialchars((string) $value);
    }

    /**
     * Build HTML for full report.
     */
    private function buildFullReportHtml(array $data): string
    {
        $project = $data['project'];
        $snapshot = $data['hrSystemSnapshot'];
        $stepStatuses = $data['stepStatuses'];
        $jobDefinitions = $data['jobDefinitions'];
        $compensationDetails = $data['compensationDetails'];

        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>HR System Report - ' . htmlspecialchars($project->company->name) . '</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 30px; 
            color: #1f2937; 
            background: #ffffff;
            line-height: 1.6;
        }
        .header { 
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header h1 { 
            font-size: 32px;
            margin-bottom: 15px;
            font-weight: 700;
        }
        .header p { 
            margin: 8px 0;
            font-size: 14px;
            opacity: 0.95;
        }
        .header-info {
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            margin-top: 20px;
        }
        .header-info-item {
            flex: 1;
            min-width: 200px;
        }
        .section { 
            margin-bottom: 40px; 
            page-break-inside: avoid; 
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        .section-title { 
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white; 
            padding: 18px 25px; 
            margin: 0;
            font-size: 20px; 
            font-weight: 600;
        }
        .section-content {
            padding: 25px;
        }
        .subsection { 
            margin-bottom: 20px; 
        }
        .subsection-title { 
            font-weight: 600; 
            color: #2563eb; 
            margin-bottom: 12px;
            font-size: 16px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }
        .data-row { 
            margin: 12px 0; 
            padding: 12px;
            background: #f9fafb;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
            display: flex;
            align-items: center;
        }
        .data-label { 
            font-weight: 600; 
            color: #374151;
            min-width: 220px;
            margin-right: 15px;
        }
        .data-value { 
            color: #1f2937;
            flex: 1;
        }
        .status-badge { 
            display: inline-block; 
            padding: 6px 14px; 
            border-radius: 20px; 
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-completed { background: #10b981; color: white; }
        .status-in-progress { background: #f59e0b; color: white; }
        .status-not-started { background: #6b7280; color: white; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        th, td { 
            border: 1px solid #e5e7eb; 
            padding: 12px 15px; 
            text-align: left; 
        }
        th { 
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            font-weight: 600;
            font-size: 14px;
        }
        td {
            background: #ffffff;
        }
        tr:nth-child(even) td {
            background: #f9fafb;
        }
        .page-break { page-break-before: always; }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        .highlight-box {
            background: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 15px 0;
            border-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>HR System Comprehensive Report</h1>
        <div class="header-info">
            <div class="header-info-item">
                <p><strong>Company:</strong> ' . htmlspecialchars($project->company->name) . '</p>
                <p><strong>Generated:</strong> ' . date('F d, Y H:i') . '</p>
            </div>
            <div class="header-info-item">
                <p><strong>Project Status:</strong> <span class="status-badge status-' . ($snapshot['hr_system_report']['status'] === 'Ready' ? 'completed' : 'in-progress') . '">' . $this->formatValueForHtml($snapshot['hr_system_report']['status']) . '</span></p>
            </div>
        </div>
    </div>';

        // Company Profile Section
        $html .= '<div class="section">
        <div class="section-title">1. Company Profile</div>
        <div class="section-content">
            <div class="data-row">
                <span class="data-label">Company Name:</span>
                <span class="data-value">' . $this->formatValueForHtml($snapshot['company']['name']) . '</span>
            </div>
            <div class="data-row">
                <span class="data-label">Industry:</span>
                <span class="data-value">' . $this->formatValueForHtml($snapshot['company']['industry']) . '</span>
            </div>
            <div class="data-row">
                <span class="data-label">Company Size:</span>
                <span class="data-value">' . number_format($snapshot['company']['size']) . ' employees</span>
            </div>';

        if (!empty($snapshot['ceo_philosophy']['main_trait'])) {
            $html .= '<div class="data-row">
                <span class="data-label">CEO Philosophy:</span>
                <span class="data-value">' . $this->formatValueForHtml($snapshot['ceo_philosophy']['main_trait']);
            if (!empty($snapshot['ceo_philosophy']['secondary_trait'])) {
                $html .= ', ' . $this->formatValueForHtml($snapshot['ceo_philosophy']['secondary_trait']);
            }
            $html .= '</span></div>';
        }

        $html .= '</div></div>';

        // Diagnosis Section
        if (!empty($snapshot['diagnosis'])) {
            $html .= '<div class="section page-break">
            <div class="section-title">2. CEO Diagnosis</div>
            <div class="section-content">';
            
            foreach ($snapshot['diagnosis'] as $key => $value) {
                if ($value !== null && $value !== '') {
                    $label = ucwords(str_replace('_', ' ', $key));
                    $html .= '<div class="data-row">
                        <span class="data-label">' . htmlspecialchars($label) . ':</span>
                        <span class="data-value">' . $this->formatValueForHtml($value) . '</span>
                    </div>';
                }
            }
            
            $html .= '</div></div>';
        }

        // Job Architecture Section
        $html .= '<div class="section page-break">
        <div class="section-title">3. Job Analysis & Architecture</div>
        <div class="section-content">
            <div class="data-row">
                <span class="data-label">Jobs Defined:</span>
                <span class="data-value">' . number_format($snapshot['job_architecture']['jobs_defined']) . '</span>
            </div>';

        if (!empty($snapshot['job_architecture']['structure_type'])) {
            $html .= '<div class="data-row">
                <span class="data-label">Structure Type:</span>
                <span class="data-value">' . $this->formatValueForHtml($snapshot['job_architecture']['structure_type']) . '</span>
            </div>';
        }

        if ($jobDefinitions->count() > 0) {
            $html .= '<div class="subsection">
                <div class="subsection-title">Job Definitions</div>
                <table>
                    <thead>
                        <tr>
                            <th>Job Name</th>
                            <th>Job Group</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>';
            
            foreach ($jobDefinitions as $job) {
                $html .= '<tr>
                    <td>' . htmlspecialchars($job->job_name ?? '-') . '</td>
                    <td>' . htmlspecialchars($job->job_group ?? '-') . '</td>
                    <td>' . htmlspecialchars(substr($job->job_description ?? '', 0, 150)) . (strlen($job->job_description ?? '') > 150 ? '...' : '') . '</td>
                </tr>';
            }
            
            $html .= '</tbody></table></div>';
        }

        $html .= '</div></div>';

        // Performance Management Section
        $html .= '<div class="section page-break">
        <div class="section-title">4. Performance Management System</div>
        <div class="section-content">';

        if (!empty($snapshot['performance_management'])) {
            foreach ($snapshot['performance_management'] as $key => $value) {
                if ($value !== null && $value !== '') {
                    $label = ucwords(str_replace('_', ' ', $key));
                    $html .= '<div class="data-row">
                        <span class="data-label">' . htmlspecialchars($label) . ':</span>
                        <span class="data-value">' . $this->formatValueForHtml($value) . '</span>
                    </div>';
                }
            }
        }

        $html .= '</div></div>';

        // Compensation & Benefits Section
        $html .= '<div class="section page-break">
        <div class="section-title">5. Compensation & Benefits System</div>
        <div class="section-content">';

        if (!empty($snapshot['compensation_benefits'])) {
            foreach ($snapshot['compensation_benefits'] as $key => $value) {
                if ($value !== null && $value !== '') {
                    $label = ucwords(str_replace('_', ' ', $key));
                    $html .= '<div class="data-row">
                        <span class="data-label">' . htmlspecialchars($label) . ':</span>
                        <span class="data-value">' . $this->formatValueForHtml($value) . '</span>
                    </div>';
                }
            }
        }

        // Pay Bands Table
        if (!empty($compensationDetails['payBands']) && $compensationDetails['payBands']->count() > 0) {
            $html .= '<div class="subsection">
                <div class="subsection-title">Pay Bands Structure</div>
                <table>
                    <thead>
                        <tr>
                            <th>Job Grade</th>
                            <th>Min Salary</th>
                            <th>Max Salary</th>
                            <th>Target Salary</th>
                        </tr>
                    </thead>
                    <tbody>';
            
            foreach ($compensationDetails['payBands'] as $band) {
                $html .= '<tr>
                    <td>' . htmlspecialchars($band->job_grade ?? '-') . '</td>
                    <td>' . number_format($band->min_salary ?? 0, 2) . '</td>
                    <td>' . number_format($band->max_salary ?? 0, 2) . '</td>
                    <td>' . number_format($band->target_salary ?? 0, 2) . '</td>
                </tr>';
            }
            
            $html .= '</tbody></table></div>';
        }

        $html .= '</div></div>';

        // Step Status Summary
        $html .= '<div class="section page-break">
        <div class="section-title">6. Project Step Status Summary</div>
        <div class="section-content">';

        foreach ($stepStatuses as $step => $status) {
            $statusClass = in_array($status, ['submitted', 'approved', 'locked', 'completed']) 
                ? 'completed' 
                : ($status === 'in_progress' ? 'in-progress' : 'not-started');
            $html .= '<div class="data-row">
                <span class="data-label">' . ucwords(str_replace('_', ' ', $step)) . ':</span>
                <span class="data-value">
                    <span class="status-badge status-' . $statusClass . '">' . ucwords(str_replace('_', ' ', $status)) . '</span>
                </span>
            </div>';
        }

        $html .= '</div></div>';

        $html .= '<div class="footer">
            <p>This report was generated by HR Path-Finder by BetterCompany</p>
            <p>Generated on ' . date('F d, Y \a\t H:i:s') . '</p>
        </div>';

        $html .= '</body></html>';

        return $html;
    }

    /**
     * Build HTML for step-specific report.
     */
    private function buildStepReportHtml(array $data, string $step): string
    {
        $project = $data['project'];
        $snapshot = $data['hrSystemSnapshot'];
        $jobDefinitions = $data['jobDefinitions'] ?? collect();
        $compensationDetails = $data['compensationDetails'] ?? [];
        
        $stepTitles = [
            'diagnosis' => 'CEO Diagnosis Report',
            'job_analysis' => 'Job Analysis Report',
            'performance' => 'Performance Management System Report',
            'compensation' => 'Compensation & Benefits System Report',
            'hr_policy_os' => 'HR Policy OS Report',
        ];

        $title = $stepTitles[$step] ?? ucwords(str_replace('_', ' ', $step)) . ' Report';

        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>' . htmlspecialchars($title) . '</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 30px; 
            color: #1f2937; 
            background: #ffffff;
            line-height: 1.6;
        }
        .header { 
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header h1 { 
            font-size: 28px;
            margin-bottom: 15px;
            font-weight: 700;
        }
        .header p { 
            margin: 8px 0;
            font-size: 14px;
            opacity: 0.95;
        }
        .section { 
            margin-bottom: 30px; 
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        .section-title {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 18px 25px;
            margin: 0;
            font-size: 20px;
            font-weight: 600;
        }
        .section-content {
            padding: 25px;
        }
        .data-row { 
            margin: 12px 0; 
            padding: 12px;
            background: #f9fafb;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
            display: flex;
            align-items: center;
        }
        .data-label { 
            font-weight: 600; 
            color: #374151;
            min-width: 220px;
            margin-right: 15px;
        }
        .data-value { 
            color: #1f2937;
            flex: 1;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        th, td { 
            border: 1px solid #e5e7eb; 
            padding: 12px 15px; 
            text-align: left; 
        }
        th { 
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            font-weight: 600;
            font-size: 14px;
        }
        td {
            background: #ffffff;
        }
        tr:nth-child(even) td {
            background: #f9fafb;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>' . htmlspecialchars($title) . '</h1>
        <p><strong>Company:</strong> ' . htmlspecialchars($project->company->name) . '</p>
        <p><strong>Generated:</strong> ' . date('F d, Y H:i') . '</p>
    </div>';

        // Step-specific content
        switch ($step) {
            case 'diagnosis':
                if (!empty($snapshot['diagnosis'])) {
                    $html .= '<div class="section">
                        <div class="section-title">Diagnosis Details</div>
                        <div class="section-content">';
                    foreach ($snapshot['diagnosis'] as $key => $value) {
                        if ($value !== null && $value !== '') {
                            $label = ucwords(str_replace('_', ' ', $key));
                            $html .= '<div class="data-row">
                                <span class="data-label">' . htmlspecialchars($label) . ':</span>
                                <span class="data-value">' . $this->formatValueForHtml($value) . '</span>
                            </div>';
                        }
                    }
                    $html .= '</div></div>';
                }
                break;

            case 'job_analysis':
                $html .= '<div class="section">
                    <div class="section-title">Job Analysis Details</div>
                    <div class="section-content">
                        <div class="data-row">
                            <span class="data-label">Jobs Defined:</span>
                            <span class="data-value">' . number_format($snapshot['job_architecture']['jobs_defined'] ?? 0) . '</span>
                        </div>';
                if (!empty($snapshot['job_architecture']['structure_type'])) {
                    $html .= '<div class="data-row">
                        <span class="data-label">Structure Type:</span>
                        <span class="data-value">' . $this->formatValueForHtml($snapshot['job_architecture']['structure_type']) . '</span>
                    </div>';
                }
                if ($jobDefinitions->count() > 0) {
                    $html .= '<table>
                        <thead>
                            <tr>
                                <th>Job Name</th>
                                <th>Job Group</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>';
                    foreach ($jobDefinitions as $job) {
                        $html .= '<tr>
                            <td>' . htmlspecialchars($job->job_name ?? '-') . '</td>
                            <td>' . htmlspecialchars($job->job_group ?? '-') . '</td>
                            <td>' . htmlspecialchars(substr($job->job_description ?? '', 0, 150)) . '</td>
                        </tr>';
                    }
                    $html .= '</tbody></table>';
                }
                $html .= '</div></div>';
                break;

            case 'performance':
                $html .= '<div class="section">
                    <div class="section-title">Performance Management Details</div>
                    <div class="section-content">';
                if (!empty($snapshot['performance_management'])) {
                    foreach ($snapshot['performance_management'] as $key => $value) {
                        if ($value !== null && $value !== '') {
                            $label = ucwords(str_replace('_', ' ', $key));
                            $html .= '<div class="data-row">
                                <span class="data-label">' . htmlspecialchars($label) . ':</span>
                                <span class="data-value">' . $this->formatValueForHtml($value) . '</span>
                            </div>';
                        }
                    }
                }
                $html .= '</div></div>';
                break;

            case 'compensation':
                $html .= '<div class="section">
                    <div class="section-title">Compensation & Benefits Details</div>
                    <div class="section-content">';
                if (!empty($snapshot['compensation_benefits'])) {
                    foreach ($snapshot['compensation_benefits'] as $key => $value) {
                        if ($value !== null && $value !== '') {
                            $label = ucwords(str_replace('_', ' ', $key));
                            $html .= '<div class="data-row">
                                <span class="data-label">' . htmlspecialchars($label) . ':</span>
                                <span class="data-value">' . $this->formatValueForHtml($value) . '</span>
                            </div>';
                        }
                    }
                }
                if (!empty($compensationDetails['payBands']) && $compensationDetails['payBands']->count() > 0) {
                    $html .= '<table style="margin-top: 20px;">
                        <thead>
                            <tr>
                                <th>Job Grade</th>
                                <th>Min Salary</th>
                                <th>Max Salary</th>
                                <th>Target Salary</th>
                            </tr>
                        </thead>
                        <tbody>';
                    foreach ($compensationDetails['payBands'] as $band) {
                        $html .= '<tr>
                            <td>' . htmlspecialchars($band->job_grade ?? '-') . '</td>
                            <td>' . number_format($band->min_salary ?? 0, 2) . '</td>
                            <td>' . number_format($band->max_salary ?? 0, 2) . '</td>
                            <td>' . number_format($band->target_salary ?? 0, 2) . '</td>
                        </tr>';
                    }
                    $html .= '</tbody></table>';
                }
                $html .= '</div></div>';
                break;

            default:
                $html .= '<div class="section">
                    <div class="section-content">
                        <p>This report contains detailed information about the ' . htmlspecialchars($step) . ' step.</p>
                    </div>
                </div>';
        }

        $html .= '<div class="footer">
            <p>This report was generated by HR Path-Finder by BetterCompany</p>
            <p>Generated on ' . date('F d, Y \a\t H:i:s') . '</p>
        </div>';

        $html .= '</body></html>';

        return $html;
    }

    /**
     * Generate PDF from HTML.
     */
    private function generatePdf(string $html): string
    {
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('defaultFont', 'Arial');
        $options->set('isPhpEnabled', true);
        $options->set('chroot', base_path());

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }
}
