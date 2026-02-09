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

        // Update company's is_public field if provided
        if ($request->has('is_public')) {
            $hrProject->company->update(['is_public' => $request->boolean('is_public')]);
        }
        
        // Update company's registration_number if provided
        if (isset($data['registration_number'])) {
            $hrProject->company->update(['registration_number' => $data['registration_number']]);
            // Remove from diagnosis data as it's stored in company table
            unset($data['registration_number']);
        }

        if ($diagnosis) {
            $oldAttributes = $diagnosis->toArray();
            
            // Handle file uploads for organizational charts
            if ($request->hasFile('organizational_charts')) {
                $charts = [];
                foreach ($request->file('organizational_charts') as $year => $file) {
                    if ($file) {
                        $path = $file->store('organizational-charts', 'public');
                        $charts[$year] = $path;
                    }
                }
                $data['organizational_charts'] = $charts;
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

        return back()->with('success', 'Diagnosis data saved successfully.');
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
     * Submit diagnosis for CEO review.
     */
    public function submit(Request $request, HrProject $hrProject)
    {
        // Only HR Manager can submit
        if (!$request->user()->hasRole('hr_manager')) {
            abort(403);
        }

        $diagnosis = $hrProject->diagnosis;
        
        if (!$diagnosis) {
            return back()->withErrors(['error' => 'Please complete the diagnosis first.']);
        }

        $diagnosis->update(['status' => StepStatus::SUBMITTED]);
        $hrProject->setStepStatus('diagnosis', StepStatus::SUBMITTED);

        $this->auditLogService->log(
            $hrProject,
            $request->user(),
            'diagnosis_submitted'
        );

        // Notify CEO
        $ceos = $hrProject->company->ceos()->get();
        foreach ($ceos as $ceo) {
            Notification::send($ceo, new DiagnosisSubmittedNotification($hrProject));
        }

        return redirect()->route('hr-manager.dashboard')->with('success', 'Diagnosis submitted for CEO review.');
    }
}
