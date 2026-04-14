<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompensationSnapshotQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompensationSnapshotQuestionController extends Controller
{
    /**
     * Normalize question payload for frontend forms.
     *
     * @return array<string, mixed>
     */
    private function toQuestionPayload(CompensationSnapshotQuestion $question): array
    {
        return [
            'id' => $question->id,
            'question_text' => (string) ($question->question_text ?? ''),
            'answer_type' => (string) ($question->answer_type ?? 'select_one'),
            'options' => is_array($question->options) ? $question->options : [],
            'order' => (int) ($question->order ?? 0),
            'is_active' => (bool) ($question->is_active ?? true),
            'version' => $question->version,
            'metadata' => is_array($question->metadata) ? $question->metadata : null,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $questions = CompensationSnapshotQuestion::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/CompensationSnapshot/Index', [
            'questions' => $questions,
            'answerTypes' => [
                'select_one' => 'Select One',
                'select_up_to_2' => 'Select up to 2',
                'multiple' => 'Multiple Selection (Unlimited)',
                'numeric' => 'Numeric Input',
                'numeric_multi_year' => 'Numeric - Year by Year',
                'numeric_job_rows' => 'Text + Numeric Rows',
                'numeric_service_ranges' => 'Numeric - Years of Service',
                'text' => 'Text Input',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $parentQuestionCandidates = CompensationSnapshotQuestion::query()
            ->orderBy('order')
            ->orderBy('id')
            ->get(['id', 'order', 'question_text'])
            ->map(fn (CompensationSnapshotQuestion $q) => [
                'id' => $q->id,
                'order' => (int) $q->order,
                'label' => "Q{$q->order} - {$q->question_text}",
            ])
            ->values();

        return Inertia::render('Admin/CompensationSnapshot/Create', [
            'answerTypes' => [
                'select_one' => 'Select One',
                'select_up_to_2' => 'Select up to 2',
                'multiple' => 'Multiple Selection (Unlimited)',
                'numeric' => 'Numeric Input',
                'numeric_multi_year' => 'Numeric - Year by Year',
                'numeric_job_rows' => 'Text + Numeric Rows',
                'numeric_service_ranges' => 'Numeric - Years of Service',
                'text' => 'Text Input',
            ],
            'parentQuestionCandidates' => $parentQuestionCandidates,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'answer_type' => ['required', 'string', 'in:select_one,select_up_to_2,multiple,numeric,numeric_multi_year,numeric_job_rows,numeric_service_ranges,text'],
            'options' => ['nullable', 'array'],
            'options.*' => ['nullable', 'string'],
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
        $parentQuestionCandidates = CompensationSnapshotQuestion::query()
            ->where('id', '!=', $compensationSnapshotQuestion->id)
            ->orderBy('order')
            ->orderBy('id')
            ->get(['id', 'order', 'question_text'])
            ->map(fn (CompensationSnapshotQuestion $q) => [
                'id' => $q->id,
                'order' => (int) $q->order,
                'label' => "Q{$q->order} - {$q->question_text}",
            ])
            ->values();

        return Inertia::render('Admin/CompensationSnapshot/Edit', [
            'question' => $this->toQuestionPayload($compensationSnapshotQuestion),
            'answerTypes' => [
                'select_one' => 'Select One',
                'select_up_to_2' => 'Select up to 2',
                'multiple' => 'Multiple Selection (Unlimited)',
                'numeric' => 'Numeric Input',
                'numeric_multi_year' => 'Numeric - Year by Year',
                'numeric_job_rows' => 'Text + Numeric Rows',
                'numeric_service_ranges' => 'Numeric - Years of Service',
                'text' => 'Text Input',
            ],
            'parentQuestionCandidates' => $parentQuestionCandidates,
        ]);
    }

    /**
     * Return fresh question payload for edit page hydration.
     */
    public function editData(CompensationSnapshotQuestion $compensationSnapshotQuestion): JsonResponse
    {
        return response()->json([
            'question' => $this->toQuestionPayload($compensationSnapshotQuestion),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CompensationSnapshotQuestion $compensationSnapshotQuestion)
    {
        $validated = $this->validateQuestionPayload($request);

        $compensationSnapshotQuestion->update($validated);

        return redirect()->route('admin.compensation-snapshot.index')
            ->with('success', 'Question updated successfully.');
    }

    /**
     * Update question via JSON (avoids Inertia redirect edge cases).
     */
    public function updateData(Request $request, CompensationSnapshotQuestion $compensationSnapshotQuestion): JsonResponse
    {
        $validated = $this->validateQuestionPayload($request);

        $compensationSnapshotQuestion->update($validated);

        return response()->json([
            'success' => true,
            'question' => $this->toQuestionPayload($compensationSnapshotQuestion->fresh()),
        ]);
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

        return redirect()
            ->back()
            ->with('success', 'Question order updated successfully.');
    }

    /**
     * Validate and normalize question payload.
     *
     * @return array<string, mixed>
     */
    private function validateQuestionPayload(Request $request): array
    {
        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'answer_type' => ['required', 'string', 'in:select_one,select_up_to_2,multiple,numeric,numeric_multi_year,numeric_job_rows,numeric_service_ranges,text'],
            'options' => ['nullable', 'array'],
            'options.*' => ['nullable', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'version' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ]);

        if (in_array($validated['answer_type'], ['select_one', 'select_up_to_2', 'multiple'], true)) {
            $request->validate([
                'options' => ['required', 'array', 'min:1'],
            ]);
        } else {
            $validated['options'] = null;
        }

        if (is_array($validated['metadata'] ?? null)) {
            $metadata = $validated['metadata'];

            if (array_key_exists('parent_question_order', $metadata)) {
                $value = $metadata['parent_question_order'];
                $metadata['parent_question_order'] = ($value === '' || $value === null)
                    ? null
                    : (int) $value;
            }

            if (array_key_exists('show_when_parent_option_includes', $metadata)) {
                $value = $metadata['show_when_parent_option_includes'];
                $metadata['show_when_parent_option_includes'] =
                    is_string($value) && trim($value) === '' ? null : $value;
            }

            $validated['metadata'] = array_filter(
                $metadata,
                fn ($value) => $value !== null && $value !== ''
            );
            if ($validated['metadata'] === []) {
                $validated['metadata'] = null;
            }
        }

        return $validated;
    }
}
