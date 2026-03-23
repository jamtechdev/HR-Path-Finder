<?php

namespace App\Http\Controllers;

use App\Enums\StepStatus;
use App\Http\Requests\StoreDiagnosisRequest;
use App\Models\Diagnosis;
use App\Models\HrProject;
use App\Notifications\DiagnosisSubmittedNotification;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;

class DiagnosisController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {
    }

    /**
     * Store or update diagnosis data.
     */
    public function store(StoreDiagnosisRequest $request, HrProject $hrProject)
    {
        // Check authorization
        if (!$hrProject->company->users->contains($request->user()) && !$request->user()->hasRole(['ceo', 'consultant', 'admin'])) {
            abort(403);
        }

        // Check if diagnosis can be edited
        $diagnosis = $hrProject->diagnosis;
        $canEdit = !$diagnosis || in_array($diagnosis->status, [StepStatus::NOT_STARTED, StepStatus::IN_PROGRESS]);
        
        // CEO and HR Manager can edit even if submitted (for updates)
        if ($diagnosis && $diagnosis->status === StepStatus::SUBMITTED) {
            if ($request->user()->hasRole(['ceo', 'hr_manager'])) {
                $canEdit = true;
            }
        }

        if (!$canEdit) {
            return back()->withErrors(['error' => 'Diagnosis cannot be edited at this stage.']);
        }

        $data = $request->validated();

        // Format registration number if provided (ensure it follows 000-00-00000 format)
        if (isset($data['registration_number']) && $data['registration_number']) {
            $regNumber = preg_replace('/\D/', '', $data['registration_number']); // Remove non-digits
            if (strlen($regNumber) >= 3) {
                // Format as 000-00-00000 if we have enough digits
                if (strlen($regNumber) >= 10) {
                    $data['registration_number'] = substr($regNumber, 0, 3) . '-' . substr($regNumber, 3, 2) . '-' . substr($regNumber, 5, 5);
                } else {
                    // For shorter numbers, just keep as is (for existing data compatibility)
                    $data['registration_number'] = $regNumber;
                }
            }
        }

        // Update company fields if provided
        $companyUpdates = [];
        
        if ($request->has('is_public')) {
            $companyUpdates['is_public'] = $request->boolean('is_public');
        }
        
        if (isset($data['registration_number'])) {
            $companyUpdates['registration_number'] = $data['registration_number'];
            unset($data['registration_number']); // Remove from diagnosis data
        }
        
        if (isset($data['foundation_date'])) {
            $companyUpdates['foundation_date'] = $data['foundation_date'];
            unset($data['foundation_date']); // Remove from diagnosis data
        }
        
        if (isset($data['brand_name'])) {
            $companyUpdates['brand_name'] = $data['brand_name'];
            unset($data['brand_name']); // Remove from diagnosis data
        }
        
        if (!empty($companyUpdates)) {
            $hrProject->company->update($companyUpdates);
        }

        if ($diagnosis) {
            $oldAttributes = $diagnosis->toArray();

            $existingCharts = is_array($diagnosis->organizational_charts) ? $diagnosis->organizational_charts : [];

            // Handle file uploads for organizational charts (merge years, never wipe other slots)
            if ($request->hasFile('organizational_charts')) {
                $charts = $existingCharts;
                foreach ($request->file('organizational_charts') as $year => $file) {
                    if ($file) {
                        $path = $file->store('organizational-charts', 'public');
                        $charts[$year] = $path;
                    }
                }
                $data['organizational_charts'] = $charts;
            } elseif (array_key_exists('organizational_charts', $data)) {
                // Do not persist empty JSON from other tabs overwriting stored paths
                $incoming = $data['organizational_charts'];
                if (! is_array($incoming) || ! $this->organizationalChartsHasAnyPath($incoming)) {
                    unset($data['organizational_charts']);
                } else {
                    $data['organizational_charts'] = array_merge($existingCharts, $incoming);
                }
            }
            
            $diagnosis->update($data);
            
            // Log changes if CEO is editing
            if ($request->user()->hasRole('ceo')) {
                $this->auditLogService->logUpdate(
                    $hrProject,
                    $request->user(),
                    $diagnosis,
                    $oldAttributes,
                    $diagnosis->toArray()
                );
            }
        } else {
            if ($request->hasFile('organizational_charts')) {
                $charts = [];
                foreach ($request->file('organizational_charts') as $year => $file) {
                    if ($file) {
                        $charts[$year] = $file->store('organizational-charts', 'public');
                    }
                }
                $data['organizational_charts'] = $charts;
            } elseif (array_key_exists('organizational_charts', $data) && (! is_array($data['organizational_charts']) || ! $this->organizationalChartsHasAnyPath($data['organizational_charts']))) {
                unset($data['organizational_charts']);
            }

            $diagnosis = Diagnosis::create(array_merge($data, [
                'hr_project_id' => $hrProject->id,
                'status' => StepStatus::IN_PROGRESS,
            ]));
        }

        // Update project step status
        $hrProject->setStepStatus('diagnosis', StepStatus::IN_PROGRESS);
        
        // Calculate and update individual step statuses based on diagnosis data
        $this->updateDiagnosisStepStatuses($hrProject, $diagnosis);
        
        // Reload the project to get updated step statuses
        $hrProject->refresh();

        return back();
    }
    
    /**
     * Calculate and update individual diagnosis step statuses based on data.
     */
    protected function updateDiagnosisStepStatuses(HrProject $hrProject, Diagnosis $diagnosis): void
    {
        $stepStatuses = $hrProject->step_statuses ?? [];
        
        // Define step completion checks
        $stepChecks = [
            'company-info' => function($diagnosis) {
                return !empty($diagnosis->industry_category);
            },
            'workforce' => function($diagnosis) {
                return !empty($diagnosis->present_headcount) && $diagnosis->present_headcount > 0;
            },
            'executives' => function($diagnosis) {
                return !empty($diagnosis->total_executives) || 
                       (!empty($diagnosis->executive_positions) && is_array($diagnosis->executive_positions) && count($diagnosis->executive_positions) > 0);
            },
            'leaders' => function($diagnosis) {
                return !empty($diagnosis->leadership_count);
            },
            'job-grades' => function($diagnosis) {
                return !empty($diagnosis->job_grade_names) && is_array($diagnosis->job_grade_names) && count($diagnosis->job_grade_names) > 0;
            },
            'organizational-charts' => function($diagnosis) {
                $charts = $diagnosis->organizational_charts;
                if (is_array($charts)) {
                    return count($charts) > 0;
                }
                if (is_object($charts)) {
                    return count((array)$charts) > 0;
                }
                return false;
            },
            'organizational-structure' => function($diagnosis) {
                $structure = $diagnosis->org_structure_types;
                if (is_array($structure)) {
                    return count($structure) > 0;
                }
                if (is_object($structure)) {
                    return count((array)$structure) > 0;
                }
                return false;
            },
            'job-structure' => function($diagnosis) {
                return (!empty($diagnosis->job_categories) && is_array($diagnosis->job_categories) && count($diagnosis->job_categories) > 0) ||
                       (!empty($diagnosis->job_functions) && is_array($diagnosis->job_functions) && count($diagnosis->job_functions) > 0);
            },
            'hr-issues' => function($diagnosis) {
                return (!empty($diagnosis->hr_issues) && is_array($diagnosis->hr_issues) && count($diagnosis->hr_issues) > 0) ||
                       !empty($diagnosis->custom_hr_issues);
            },
        ];
        
        // Update step statuses based on completion
        foreach ($stepChecks as $step => $check) {
            if ($check($diagnosis)) {
                $stepStatuses[$step] = 'completed';
            } elseif (!isset($stepStatuses[$step])) {
                // Only set to in_progress if there's any data for this step
                $hasData = false;
                switch ($step) {
                    case 'company-info':
                        $hasData = !empty($diagnosis->industry_category) || !empty($diagnosis->industry_subcategory);
                        break;
                    case 'workforce':
                        $hasData = !empty($diagnosis->present_headcount) || !empty($diagnosis->expected_headcount_1y);
                        break;
                    case 'executives':
                        $hasData = !empty($diagnosis->total_executives) || 
                                  (!empty($diagnosis->executive_positions) && (
                                      (is_array($diagnosis->executive_positions) && count($diagnosis->executive_positions) > 0) ||
                                      (is_object($diagnosis->executive_positions) && count((array)$diagnosis->executive_positions) > 0)
                                  ));
                        break;
                    case 'leaders':
                        $hasData = !empty($diagnosis->leadership_count);
                        break;
                    case 'job-grades':
                        $hasData = !empty($diagnosis->job_grade_names);
                        break;
                    case 'organizational-charts':
                        $hasData = !empty($diagnosis->organizational_charts);
                        break;
                    case 'organizational-structure':
                        $hasData = !empty($diagnosis->org_structure_types) || !empty($diagnosis->organizational_structure);
                        break;
                    case 'job-structure':
                        $hasData = !empty($diagnosis->job_categories) || !empty($diagnosis->job_functions);
                        break;
                    case 'hr-issues':
                        $hasData = !empty($diagnosis->hr_issues) || !empty($diagnosis->custom_hr_issues);
                        break;
                }
                
                if ($hasData) {
                    $stepStatuses[$step] = 'in_progress';
                }
            }
        }
        
        // Update the project with new step statuses
        $hrProject->step_statuses = $stepStatuses;
        $hrProject->save();
    }

    /**
     * @param  array<mixed>  $charts
     */
    protected function organizationalChartsHasAnyPath(array $charts): bool
    {
        foreach ($charts as $value) {
            if (is_string($value) && trim($value) !== '') {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<string, string>
     */
    protected function validateDiagnosisSubmitPayload(array $d): array
    {
        $e = [];
        if (trim((string) ($d['industry_category'] ?? '')) === '') {
            $e['industry_category'] = 'Primary industry is required.';
        }
        if ((int) ($d['present_headcount'] ?? 0) <= 0) {
            $e['present_headcount'] = 'Present workforce is required.';
        }
        $charts = $d['organizational_charts'] ?? [];
        if (is_string($charts)) {
            $charts = json_decode($charts, true) ?? [];
        }
        if (! is_array($charts)) {
            $charts = [];
        }
        foreach (['2023.12', '2024.12', '2025.12'] as $y) {
            if (empty($charts[$y])) {
                $e['organizational_charts'] = 'Upload organizational charts for all required years (2023.12, 2024.12, 2025.12).';

                break;
            }
        }
        $st = $d['org_structure_types'] ?? null;
        if (empty($st) || (is_array($st) && count($st) === 0)) {
            $e['org_structure_types'] = 'Select at least one organizational structure type.';
        }
        $jc = $d['job_categories'] ?? [];
        $jf = $d['job_functions'] ?? [];
        if ((! is_array($jc) || count($jc) === 0) && (! is_array($jf) || count($jf) === 0)) {
            $e['job_structure'] = 'Add at least one job category or job function.';
        }
        $jg = $d['job_grade_names'] ?? [];
        if (! is_array($jg) || count($jg) === 0) {
            $e['job_grade_names'] = 'Add at least one job grade.';
        }

        return $e;
    }

    /**
     * Persist diagnosis from a merged array (paths for org charts, no file uploads in $data).
     */
    protected function persistDiagnosisFromSubmitData(HrProject $hrProject, array $data): Diagnosis
    {
        $companyUpdates = [];
        foreach (['is_public', 'registration_number', 'foundation_date', 'brand_name'] as $f) {
            if (array_key_exists($f, $data)) {
                if ($f === 'is_public') {
                    $companyUpdates['is_public'] = (bool) $data[$f];
                } else {
                    $companyUpdates[$f] = $data[$f];
                }
                unset($data[$f]);
            }
        }
        if (isset($data['registration_number']) && $data['registration_number']) {
            $regNumber = preg_replace('/\D/', '', $data['registration_number']);
            if (strlen($regNumber) >= 3) {
                if (strlen($regNumber) >= 10) {
                    $data['registration_number'] = substr($regNumber, 0, 3).'-'.substr($regNumber, 3, 2).'-'.substr($regNumber, 5, 5);
                } else {
                    $data['registration_number'] = $regNumber;
                }
            }
        }
        if (isset($data['registration_number'])) {
            $companyUpdates['registration_number'] = $data['registration_number'];
            unset($data['registration_number']);
        }
        if (isset($data['foundation_date'])) {
            $companyUpdates['foundation_date'] = $data['foundation_date'];
            unset($data['foundation_date']);
        }
        if (isset($data['brand_name'])) {
            $companyUpdates['brand_name'] = $data['brand_name'];
            unset($data['brand_name']);
        }
        if (! empty($companyUpdates)) {
            $hrProject->company->update($companyUpdates);
        }

        $diagnosis = $hrProject->diagnosis;
        $fillable = (new Diagnosis)->getFillable();
        $data = array_intersect_key($data, array_flip($fillable));

        if (array_key_exists('organizational_charts', $data)) {
            $incoming = $data['organizational_charts'];
            if (! is_array($incoming) || ! $this->organizationalChartsHasAnyPath($incoming)) {
                unset($data['organizational_charts']);
            } elseif ($diagnosis) {
                $existing = is_array($diagnosis->organizational_charts) ? $diagnosis->organizational_charts : [];
                $data['organizational_charts'] = array_merge($existing, $incoming);
            }
        }

        if ($diagnosis) {
            $diagnosis->update($data);
        } else {
            $diagnosis = Diagnosis::create(array_merge($data, [
                'hr_project_id' => $hrProject->id,
                'status' => StepStatus::IN_PROGRESS,
            ]));
        }

        $hrProject->setStepStatus('diagnosis', StepStatus::IN_PROGRESS);
        $this->updateDiagnosisStepStatuses($hrProject, $diagnosis);
        $hrProject->refresh();

        return $diagnosis->fresh();
    }

    /**
     * Submit diagnosis for CEO review.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        if (! $request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $merged = [];
        if ($request->filled('diagnosis_payload')) {
            $decoded = json_decode($request->string('diagnosis_payload')->toString(), true);
            $merged = is_array($decoded) ? $decoded : [];
        } else {
            $diag = $hrProject->diagnosis;
            if ($diag) {
                $merged = $diag->toArray();
            }
        }

        foreach (['2023.12', '2024.12', '2025.12'] as $year) {
            $field = 'org_chart_'.str_replace('.', '_', $year);
            if ($request->hasFile($field)) {
                if (! isset($merged['organizational_charts']) || ! is_array($merged['organizational_charts'])) {
                    $merged['organizational_charts'] = [];
                }
                $merged['organizational_charts'][$year] = $request->file($field)->store('organizational-charts', 'public');
            }
        }

        if ($request->hasFile('company_logo')) {
            $path = $request->file('company_logo')->store('company-logos', 'public');
            $hrProject->company->update(['logo_path' => $path]);
        }

        if (count($merged) > 0) {
            $hardErrors = $this->validateDiagnosisSubmitPayload($merged);
            if (count($hardErrors) > 0) {
                return back()->withErrors($hardErrors);
            }

            $validator = Validator::make($merged, (new StoreDiagnosisRequest)->rules());
            $validator->after(function ($validator) use ($merged) {
                $presentHeadcount = (int) ($merged['present_headcount'] ?? 0);
                $genderMale = (int) ($merged['gender_male'] ?? 0);
                $genderFemale = (int) ($merged['gender_female'] ?? 0);
                $genderOther = (int) ($merged['gender_other'] ?? 0);
                $genderSum = $genderMale + $genderFemale + $genderOther;
                if ($presentHeadcount > 0 && $genderSum > $presentHeadcount) {
                    $validator->errors()->add('gender_male', "Gender sum ({$genderSum}) cannot exceed total workforce ({$presentHeadcount})");
                }
                $leadershipCount = (int) ($merged['leadership_count'] ?? 0);
                if ($presentHeadcount > 0 && $leadershipCount > $presentHeadcount) {
                    $validator->errors()->add('leadership_count', "Leadership count ({$leadershipCount}) cannot exceed total workforce ({$presentHeadcount})");
                }
                if (trim((string) ($merged['industry_category'] ?? '')) === 'Others' && ! trim((string) ($merged['industry_category_other'] ?? ''))) {
                    $validator->errors()->add('industry_category_other', 'Please specify the primary industry when selecting Others.');
                }
            });
            try {
                $validated = $validator->validate();
            } catch (\Illuminate\Validation\ValidationException $e) {
                return back()->withErrors($e->errors());
            }

            $this->persistDiagnosisFromSubmitData($hrProject, $validated);
        }

        $diagnosis = $hrProject->fresh()->diagnosis;
        if (! $diagnosis) {
            return back()->withErrors(['error' => 'Complete all diagnosis steps and submit from Review & Submit.']);
        }

        $finalErrors = $this->validateDiagnosisSubmitPayload($diagnosis->toArray());
        if (count($finalErrors) > 0) {
            return back()->withErrors($finalErrors);
        }

        $diagnosis->update(['status' => StepStatus::SUBMITTED]);
        $hrProject->setStepStatus('diagnosis', StepStatus::SUBMITTED);

        $this->auditLogService->log(
            $hrProject,
            $request->user(),
            'diagnosis_submitted'
        );

        $ceos = $hrProject->company->ceos()->get();
        foreach ($ceos as $ceo) {
            Notification::send($ceo, new DiagnosisSubmittedNotification($hrProject));
        }

        return back()->with('success', 'Diagnosis submitted for CEO review.');
    }
}
