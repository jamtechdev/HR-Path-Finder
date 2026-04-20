@php
    function pdfFlatten($val): string {
        if (is_null($val) || $val === '') return '-';
        if (is_bool($val)) return $val ? 'Yes' : 'No';
        if (!is_array($val)) return (string) $val;
        $flat = [];
        array_walk_recursive($val, function ($v) use (&$flat) {
            if (is_bool($v)) { $flat[] = $v ? 'Yes' : 'No'; }
            elseif (!is_null($v) && $v !== '') { $flat[] = (string) $v; }
        });
        return implode(', ', $flat) ?: '-';
    }
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HR System Report - {{ $project->company->name ?? 'Company' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 12px;
            color: #1f2937;
            background: #ffffff;
            line-height: 1.6;
            padding: 30px;
        }
        .header {
            background-color: #1e3a8a;
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .header h1 { font-size: 22px; margin-bottom: 10px; font-weight: 700; }
        .header p { font-size: 12px; margin: 4px 0; opacity: 0.9; }
        .section {
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #1e3a8a;
            color: white;
            padding: 12px 18px;
            font-size: 14px;
            font-weight: 600;
        }
        .section-content { padding: 18px; }
        .data-row {
            display: table;
            width: 100%;
            margin: 8px 0;
            padding: 8px 12px;
            background: #f9fafb;
            border-left: 3px solid #2563eb;
            border-radius: 4px;
        }
        .data-label {
            display: table-cell;
            font-weight: 600;
            color: #374151;
            width: 200px;
            padding-right: 12px;
        }
        .data-value {
            display: table-cell;
            color: #1f2937;
        }
        .subsection-title {
            font-weight: 600;
            color: #2563eb;
            margin: 14px 0 8px 0;
            font-size: 13px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
        }
        th {
            background-color: #1e3a8a;
            color: white;
            padding: 9px 12px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
        }
        td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            font-size: 11px;
            background: #ffffff;
        }
        tr:nth-child(even) td { background: #f9fafb; }
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-completed { background: #10b981; color: white; }
        .status-in-progress { background: #f59e0b; color: white; }
        .status-not-started { background: #6b7280; color: white; }
        .page-break { page-break-before: always; }
        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
        }
        .na { color: #9ca3af; font-style: italic; }
    </style>
</head>
<body>

{{-- ===== HEADER ===== --}}
<div class="header">
    <h1>HR System Comprehensive Report</h1>
    <p><strong>Company:</strong> {{ $project->company->name ?? 'N/A' }}</p>
    <p><strong>Generated:</strong> {{ now()->format('F d, Y H:i') }}</p>
    <p><strong>Report Status:</strong> {{ $snapshot['hr_system_report']['status'] ?? 'In Progress' }}</p>
</div>

{{-- ===== 1. COMPANY PROFILE ===== --}}
<div class="section">
    <div class="section-title">1. Company Profile</div>
    <div class="section-content">
        <div class="data-row">
            <span class="data-label">Company Name</span>
            <span class="data-value">{{ $snapshot['company']['name'] ?? '-' }}</span>
        </div>
        <div class="data-row">
            <span class="data-label">Industry</span>
            <span class="data-value">{{ $snapshot['company']['industry'] ?? '-' }}</span>
        </div>
        <div class="data-row">
            <span class="data-label">Company Size</span>
            <span class="data-value">
                @if(!empty($snapshot['company']['size']))
                    {{ number_format($snapshot['company']['size']) }} employees
                @else
                    <span class="na">N/A</span>
                @endif
            </span>
        </div>
        @if(!empty($snapshot['ceo_philosophy']['main_trait']))
        <div class="data-row">
            <span class="data-label">CEO Philosophy</span>
            <span class="data-value">
                {{ $snapshot['ceo_philosophy']['main_trait'] }}
                @if(!empty($snapshot['ceo_philosophy']['secondary_trait']))
                    , {{ $snapshot['ceo_philosophy']['secondary_trait'] }}
                @endif
            </span>
        </div>
        @endif
    </div>
</div>

{{-- ===== 2. HR DIAGNOSIS ===== --}}
@if(!empty($snapshot['diagnosis']))
<div class="section page-break">
    <div class="section-title">2. HR Diagnosis</div>
    <div class="section-content">
        @foreach($snapshot['diagnosis'] as $key => $value)
            @if($value !== null && $value !== '')
            <div class="data-row">
                <span class="data-label">{{ ucwords(str_replace('_', ' ', $key)) }}</span>
                <span class="data-value">{{ pdfFlatten($value) }}</span>
            </div>
            @endif
        @endforeach
    </div>
</div>
@endif

{{-- ===== 3. JOB ANALYSIS & ARCHITECTURE ===== --}}
<div class="section page-break">
    <div class="section-title">3. Job Analysis &amp; Architecture</div>
    <div class="section-content">
        <div class="data-row">
            <span class="data-label">Jobs Defined</span>
            <span class="data-value">{{ $snapshot['job_architecture']['jobs_defined'] ?? 0 }}</span>
        </div>
        @if(!empty($snapshot['job_architecture']['structure_type']))
        <div class="data-row">
            <span class="data-label">Structure Type</span>
            <span class="data-value">{{ $snapshot['job_architecture']['structure_type'] }}</span>
        </div>
        @endif
        @if(!empty($snapshot['job_architecture']['job_grade_structure']))
        <div class="data-row">
            <span class="data-label">Job Grade Structure</span>
            <span class="data-value">{{ pdfFlatten($snapshot['job_architecture']['job_grade_structure']) }}</span>
        </div>
        @endif
        @if(!empty($snapshot['job_architecture']['job_description_status']))
        <div class="data-row">
            <span class="data-label">Job Description Status</span>
            <span class="data-value">{{ $snapshot['job_architecture']['job_description_status'] }}</span>
        </div>
        @endif

        @if($jobDefinitions->count() > 0)
        <div class="subsection-title">Job Definitions</div>
        <table>
            <thead>
                <tr>
                    <th>Job Name</th>
                    <th>Job Group / Category</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                @foreach($jobDefinitions as $job)
                <tr>
                    <td>{{ $job->job_name ?? '-' }}</td>
                    <td>{{ $job->job_group ?? ($job->jobKeyword->category ?? '-') }}</td>
                    <td>{{ \Illuminate\Support\Str::limit($job->job_description ?? '', 120) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>
</div>

{{-- ===== 4. PERFORMANCE MANAGEMENT ===== --}}
<div class="section page-break">
    <div class="section-title">4. Performance Management System</div>
    <div class="section-content">
        @php $hasPerfData = false; @endphp
        @foreach($snapshot['performance_management'] as $key => $value)
            @if($value !== null && $value !== '')
            @php $hasPerfData = true; @endphp
            <div class="data-row">
                <span class="data-label">{{ ucwords(str_replace('_', ' ', $key)) }}</span>
                <span class="data-value">{{ pdfFlatten($value) }}</span>
            </div>
            @endif
        @endforeach
        @if(!$hasPerfData)
            <p class="na">No performance management data available.</p>
        @endif
    </div>
</div>

{{-- ===== 5. COMPENSATION & BENEFITS ===== --}}
<div class="section page-break">
    <div class="section-title">5. Compensation &amp; Benefits System</div>
    <div class="section-content">
        @php $hasCbData = false; @endphp
        @foreach($snapshot['compensation_benefits'] as $key => $value)
            @if($value !== null && $value !== '')
            @php $hasCbData = true; @endphp
            <div class="data-row">
                <span class="data-label">{{ ucwords(str_replace('_', ' ', $key)) }}</span>
                <span class="data-value">{{ pdfFlatten($value) }}</span>
            </div>
            @endif
        @endforeach
        @if(!$hasCbData)
            <p class="na">No compensation data available.</p>
        @endif

        {{-- Pay Bands Table --}}
        @if(!empty($compensationDetails['payBands']) && $compensationDetails['payBands']->count() > 0)
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
            <tbody>
                @foreach($compensationDetails['payBands'] as $band)
                <tr>
                    <td>{{ $band->job_grade ?? '-' }}</td>
                    <td>{{ $band->min_salary !== null ? number_format((float)$band->min_salary, 2) : '-' }}</td>
                    <td>{{ $band->max_salary !== null ? number_format((float)$band->max_salary, 2) : '-' }}</td>
                    <td>{{ $band->target_salary !== null ? number_format((float)$band->target_salary, 2) : '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        {{-- Salary Tables --}}
        @if(!empty($compensationDetails['salaryTables']) && $compensationDetails['salaryTables']->count() > 0)
        <div class="subsection-title">Salary Tables</div>
        <table>
            <thead>
                <tr>
                    <th>Grade</th>
                    <th>Min</th>
                    <th>Mid</th>
                    <th>Max</th>
                </tr>
            </thead>
            <tbody>
                @foreach($compensationDetails['salaryTables'] as $st)
                <tr>
                    <td>{{ $st->grade ?? '-' }}</td>
                    <td>{{ $st->min !== null ? number_format((float)$st->min, 2) : '-' }}</td>
                    <td>{{ $st->mid !== null ? number_format((float)$st->mid, 2) : '-' }}</td>
                    <td>{{ $st->max !== null ? number_format((float)$st->max, 2) : '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        {{-- Bonus Pool --}}
        @if(!empty($compensationDetails['bonusPoolConfig']))
        @php $bonus = $compensationDetails['bonusPoolConfig']; @endphp
        <div class="subsection-title">Bonus Pool Configuration</div>
        @if(!empty($bonus->bonus_pool_determination_criteria))
        <div class="data-row">
            <span class="data-label">Determination Criteria</span>
            <span class="data-value">{{ pdfFlatten($bonus->bonus_pool_determination_criteria) }}</span>
        </div>
        @endif
        @if(!empty($bonus->bonus_pool_determination_method))
        <div class="data-row">
            <span class="data-label">Determination Method</span>
            <span class="data-value">{{ pdfFlatten($bonus->bonus_pool_determination_method) }}</span>
        </div>
        @endif
        @endif
    </div>
</div>

{{-- ===== 6. STEP STATUS SUMMARY ===== --}}
<div class="section page-break">
    <div class="section-title">6. Project Step Status Summary</div>
    <div class="section-content">
        @foreach($stepStatuses as $step => $status)
        @php
            $statusClass = in_array($status, ['submitted', 'approved', 'locked', 'completed'])
                ? 'completed'
                : ($status === 'in_progress' ? 'in-progress' : 'not-started');
        @endphp
        <div class="data-row">
            <span class="data-label">{{ ucwords(str_replace('_', ' ', $step)) }}</span>
            <span class="data-value">
                <span class="status-badge status-{{ $statusClass }}">
                    {{ ucwords(str_replace('_', ' ', $status)) }}
                </span>
            </span>
        </div>
        @endforeach
    </div>
</div>

<div class="footer">
    <p>This report was generated by HR Path Finder by BetterCompany</p>
    <p>Generated on {{ now()->format('F d, Y \a\t H:i:s') }}</p>
</div>

</body>
</html>
