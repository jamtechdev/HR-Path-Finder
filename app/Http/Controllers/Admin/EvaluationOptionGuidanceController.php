<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EvaluationOptionGuidance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationOptionGuidanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $guidances = EvaluationOptionGuidance::orderBy('option_key')->orderBy('option_value')->get();

        $optionKeys = EvaluationOptionGuidance::distinct()->pluck('option_key')->sort()->values();

        return Inertia::render('Admin/PerformanceSystem/EvaluationOptionGuidance/Index', [
            'guidances' => $guidances,
            'optionKeys' => $optionKeys,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/PerformanceSystem/EvaluationOptionGuidance/Create', [
            'optionKeys' => [
                'org_evaluation_cycle' => 'Organizational Evaluation Cycle',
                'org_evaluation_timing' => 'Organizational Evaluation Timing',
                'org_evaluator_type' => 'Organizational Evaluator Type',
                'org_evaluation_method' => 'Organizational Evaluation Method',
                'org_rating_scale' => 'Organizational Rating Scale',
                'org_evaluation_group' => 'Organizational Evaluation Group',
                'org_use_of_results' => 'Organizational Use of Results',
                'individual_evaluation_cycle' => 'Individual Evaluation Cycle',
                'individual_evaluation_timing' => 'Individual Evaluation Timing',
                'individual_evaluator_types' => 'Individual Evaluator Types',
                'individual_evaluators' => 'Individual Evaluators',
                'individual_evaluation_method' => 'Individual Evaluation Method',
                'individual_rating_scale' => 'Individual Rating Scale',
                'individual_evaluation_groups' => 'Individual Evaluation Groups',
                'individual_use_of_results' => 'Individual Use of Results',
                'organization_leader_evaluation' => 'Organization Leader Evaluation',
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'option_key' => ['required', 'string'],
            'option_value' => ['required', 'string'],
            'concept' => ['nullable', 'string'],
            'key_characteristics' => ['nullable', 'string'],
            'example' => ['nullable', 'string'],
            'pros' => ['nullable', 'string'],
            'cons' => ['nullable', 'string'],
            'best_fit_organizations' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        EvaluationOptionGuidance::create($validated);

        return redirect()->route('admin.evaluation-option-guidance.index')
            ->with('success', 'Evaluation option guidance created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EvaluationOptionGuidance $evaluationOptionGuidance): Response
    {
        return Inertia::render('Admin/PerformanceSystem/EvaluationOptionGuidance/Edit', [
            'guidance' => $evaluationOptionGuidance,
            'optionKeys' => [
                'org_evaluation_cycle' => 'Organizational Evaluation Cycle',
                'org_evaluation_timing' => 'Organizational Evaluation Timing',
                'org_evaluator_type' => 'Organizational Evaluator Type',
                'org_evaluation_method' => 'Organizational Evaluation Method',
                'org_rating_scale' => 'Organizational Rating Scale',
                'org_evaluation_group' => 'Organizational Evaluation Group',
                'org_use_of_results' => 'Organizational Use of Results',
                'individual_evaluation_cycle' => 'Individual Evaluation Cycle',
                'individual_evaluation_timing' => 'Individual Evaluation Timing',
                'individual_evaluator_types' => 'Individual Evaluator Types',
                'individual_evaluators' => 'Individual Evaluators',
                'individual_evaluation_method' => 'Individual Evaluation Method',
                'individual_rating_scale' => 'Individual Rating Scale',
                'individual_evaluation_groups' => 'Individual Evaluation Groups',
                'individual_use_of_results' => 'Individual Use of Results',
                'organization_leader_evaluation' => 'Organization Leader Evaluation',
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EvaluationOptionGuidance $evaluationOptionGuidance)
    {
        $validated = $request->validate([
            'option_key' => ['required', 'string'],
            'option_value' => ['required', 'string'],
            'concept' => ['nullable', 'string'],
            'key_characteristics' => ['nullable', 'string'],
            'example' => ['nullable', 'string'],
            'pros' => ['nullable', 'string'],
            'cons' => ['nullable', 'string'],
            'best_fit_organizations' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $evaluationOptionGuidance->update($validated);

        return redirect()->route('admin.evaluation-option-guidance.index')
            ->with('success', 'Evaluation option guidance updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EvaluationOptionGuidance $evaluationOptionGuidance)
    {
        $evaluationOptionGuidance->delete();

        return redirect()->route('admin.evaluation-option-guidance.index')
            ->with('success', 'Evaluation option guidance deleted successfully.');
    }
}
