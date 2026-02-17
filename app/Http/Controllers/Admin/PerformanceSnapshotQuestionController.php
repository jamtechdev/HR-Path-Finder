<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PerformanceSnapshotQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PerformanceSnapshotQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $questions = PerformanceSnapshotQuestion::orderBy('order')->orderBy('id')->get();

        return Inertia::render('Admin/PerformanceSnapshot/Index', [
            'questions' => $questions,
            'answerTypes' => [
                'select_one' => 'Select One',
                'select_up_to_2' => 'Select up to 2',
                'select_all_that_apply' => 'Select all that apply',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/PerformanceSnapshot/Create', [
            'answerTypes' => [
                'select_one' => 'Select One',
                'select_up_to_2' => 'Select up to 2',
                'select_all_that_apply' => 'Select all that apply',
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'answer_type' => ['required', 'string', 'in:select_one,select_up_to_2,select_all_that_apply'],
            'options' => ['required', 'array', 'min:1'],
            'options.*' => ['required', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'version' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ]);

        $validated['order'] = $validated['order'] ?? PerformanceSnapshotQuestion::max('order') + 1;
        $validated['is_active'] = $validated['is_active'] ?? true;

        PerformanceSnapshotQuestion::create($validated);

        return redirect()->route('admin.performance-snapshot.index')
            ->with('success', 'Question created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PerformanceSnapshotQuestion $performanceSnapshotQuestion): Response
    {
        return Inertia::render('Admin/PerformanceSnapshot/Show', [
            'question' => $performanceSnapshotQuestion,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PerformanceSnapshotQuestion $performanceSnapshotQuestion): Response
    {
        return Inertia::render('Admin/PerformanceSnapshot/Edit', [
            'question' => $performanceSnapshotQuestion,
            'answerTypes' => [
                'select_one' => 'Select One',
                'select_up_to_2' => 'Select up to 2',
                'select_all_that_apply' => 'Select all that apply',
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PerformanceSnapshotQuestion $performanceSnapshotQuestion)
    {
        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'answer_type' => ['required', 'string', 'in:select_one,select_up_to_2,select_all_that_apply'],
            'options' => ['required', 'array', 'min:1'],
            'options.*' => ['required', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'version' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ]);

        $performanceSnapshotQuestion->update($validated);

        return redirect()->route('admin.performance-snapshot.index')
            ->with('success', 'Question updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PerformanceSnapshotQuestion $performanceSnapshotQuestion)
    {
        $performanceSnapshotQuestion->delete();

        return redirect()->route('admin.performance-snapshot.index')
            ->with('success', 'Question deleted successfully.');
    }

    /**
     * Reorder questions.
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'questions' => ['required', 'array'],
            'questions.*.id' => ['required', 'exists:performance_snapshot_questions,id'],
            'questions.*.order' => ['required', 'integer'],
        ]);

        foreach ($validated['questions'] as $question) {
            PerformanceSnapshotQuestion::where('id', $question['id'])->update(['order' => $question['order']]);
        }

        return response()->json(['success' => true]);
    }
}
