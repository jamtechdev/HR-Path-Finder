<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompensationSnapshotQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompensationSnapshotQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $questions = CompensationSnapshotQuestion::orderBy('order')->orderBy('id')->get();

        return Inertia::render('Admin/CompensationSnapshot/Index', [
            'questions' => $questions,
            'answerTypes' => [
                'select_one' => 'Select One',
                'select_up_to_2' => 'Select up to 2',
                'multiple' => 'Multiple Selection (Unlimited)',
                'numeric' => 'Numeric Input',
                'text' => 'Text Input',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/CompensationSnapshot/Create', [
            'answerTypes' => [
                'select_one' => 'Select One',
                'select_up_to_2' => 'Select up to 2',
                'multiple' => 'Multiple Selection (Unlimited)',
                'numeric' => 'Numeric Input',
                'text' => 'Text Input',
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
            'answer_type' => ['required', 'string', 'in:select_one,select_up_to_2,multiple,numeric,text'],
            'options' => ['nullable', 'array', 'min:1'],
            'options.*' => ['required', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'version' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ]);

        // Options are required for select types, not for numeric/text
        if (in_array($validated['answer_type'], ['select_one', 'select_up_to_2', 'multiple'])) {
            $request->validate([
                'options' => ['required', 'array', 'min:1'],
            ]);
        } else {
            $validated['options'] = null;
        }

        $validated['order'] = $validated['order'] ?? CompensationSnapshotQuestion::max('order') + 1;
        $validated['is_active'] = $validated['is_active'] ?? true;

        CompensationSnapshotQuestion::create($validated);

        return redirect()->route('admin.compensation-snapshot.index')
            ->with('success', 'Question created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CompensationSnapshotQuestion $compensationSnapshotQuestion): Response
    {
        return Inertia::render('Admin/CompensationSnapshot/Show', [
            'question' => $compensationSnapshotQuestion,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CompensationSnapshotQuestion $compensationSnapshotQuestion): Response
    {
        return Inertia::render('Admin/CompensationSnapshot/Edit', [
            'question' => $compensationSnapshotQuestion,
            'answerTypes' => [
                'select_one' => 'Select One',
                'select_up_to_2' => 'Select up to 2',
                'multiple' => 'Multiple Selection (Unlimited)',
                'numeric' => 'Numeric Input',
                'text' => 'Text Input',
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CompensationSnapshotQuestion $compensationSnapshotQuestion)
    {
        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'answer_type' => ['required', 'string', 'in:select_one,select_up_to_2,multiple,numeric,text'],
            'options' => ['nullable', 'array', 'min:1'],
            'options.*' => ['required', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'version' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ]);

        // Options are required for select types, not for numeric/text
        if (in_array($validated['answer_type'], ['select_one', 'select_up_to_2', 'multiple'])) {
            $request->validate([
                'options' => ['required', 'array', 'min:1'],
            ]);
        } else {
            $validated['options'] = null;
        }

        $compensationSnapshotQuestion->update($validated);

        return redirect()->route('admin.compensation-snapshot.index')
            ->with('success', 'Question updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CompensationSnapshotQuestion $compensationSnapshotQuestion)
    {
        $compensationSnapshotQuestion->delete();

        return redirect()->route('admin.compensation-snapshot.index')
            ->with('success', 'Question deleted successfully.');
    }

    /**
     * Reorder questions.
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'questions' => ['required', 'array'],
            'questions.*.id' => ['required', 'exists:compensation_snapshot_questions,id'],
            'questions.*.order' => ['required', 'integer'],
        ]);

        foreach ($validated['questions'] as $question) {
            CompensationSnapshotQuestion::where('id', $question['id'])->update(['order' => $question['order']]);
        }

        return response()->json(['success' => true]);
    }
}
