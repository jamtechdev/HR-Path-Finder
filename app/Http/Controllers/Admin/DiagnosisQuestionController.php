<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DiagnosisQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiagnosisQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $category = $request->get('category');
        $query = DiagnosisQuestion::query();

        if ($category) {
            $query->where('category', $category);
        }

        $questions = $query->orderBy('order')->orderBy('id')->get();

        return Inertia::render('Admin/Questions/CEO/Index', [
            'questions' => $questions,
            'categories' => [
                'management_philosophy' => 'Management Philosophy',
                'vision_mission' => 'Vision/Mission/Ideal Talent Type',
                'growth_stage' => 'Growth Stage',
                'leadership' => 'Leadership',
                'general' => 'General Questions',
                'issues' => 'Organizational Issues',
                'concerns' => 'CEO Concerns',
            ],
            'currentCategory' => $category,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Questions/CEO/Create', [
            'categories' => [
                'management_philosophy' => 'Management Philosophy',
                'vision_mission' => 'Vision/Mission/Ideal Talent Type',
                'growth_stage' => 'Growth Stage',
                'leadership' => 'Leadership',
                'general' => 'General Questions',
                'issues' => 'Organizational Issues',
                'concerns' => 'CEO Concerns',
            ],
            'questionTypes' => [
                'likert' => 'Likert Scale (1-7)',
                'text' => 'Text Input',
                'select' => 'Select Dropdown',
                'slider' => 'Slider',
                'number' => 'Number Input',
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'in:management_philosophy,vision_mission,growth_stage,leadership,general,issues,concerns'],
            'question_text' => ['required', 'string'],
            'question_type' => ['required', 'string', 'in:likert,text,select,slider,number'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'metadata' => ['nullable', 'array'],
            'options' => ['nullable', 'array'],
        ]);

        $validated['order'] = $validated['order'] ?? DiagnosisQuestion::where('category', $validated['category'])->max('order') + 1;
        $validated['is_active'] = $validated['is_active'] ?? true;

        DiagnosisQuestion::create($validated);

        return redirect()->route('admin.questions.ceo.index', ['category' => $validated['category']])
            ->with('success', 'Question created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(DiagnosisQuestion $diagnosisQuestion): Response
    {
        return Inertia::render('Admin/Questions/CEO/Show', [
            'question' => $diagnosisQuestion,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DiagnosisQuestion $diagnosisQuestion): Response
    {
        return Inertia::render('Admin/Questions/CEO/Edit', [
            'question' => $diagnosisQuestion,
            'categories' => [
                'management_philosophy' => 'Management Philosophy',
                'vision_mission' => 'Vision/Mission/Ideal Talent Type',
                'growth_stage' => 'Growth Stage',
                'leadership' => 'Leadership',
                'general' => 'General Questions',
                'issues' => 'Organizational Issues',
                'concerns' => 'CEO Concerns',
            ],
            'questionTypes' => [
                'likert' => 'Likert Scale (1-7)',
                'text' => 'Text Input',
                'select' => 'Select Dropdown',
                'slider' => 'Slider',
                'number' => 'Number Input',
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DiagnosisQuestion $diagnosisQuestion)
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'in:management_philosophy,vision_mission,growth_stage,leadership,general,issues,concerns'],
            'question_text' => ['required', 'string'],
            'question_type' => ['required', 'string', 'in:likert,text,select,slider,number'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'metadata' => ['nullable', 'array'],
            'options' => ['nullable', 'array'],
        ]);

        $diagnosisQuestion->update($validated);

        return redirect()->route('admin.questions.ceo.index', ['category' => $validated['category']])
            ->with('success', 'Question updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DiagnosisQuestion $diagnosisQuestion)
    {
        $category = $diagnosisQuestion->category;
        $diagnosisQuestion->delete();

        return redirect()->route('admin.questions.ceo.index', ['category' => $category])
            ->with('success', 'Question deleted successfully.');
    }

    /**
     * Reorder questions.
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'questions' => ['required', 'array'],
            'questions.*.id' => ['required', 'exists:diagnosis_questions,id'],
            'questions.*.order' => ['required', 'integer'],
        ]);

        foreach ($validated['questions'] as $question) {
            DiagnosisQuestion::where('id', $question['id'])->update(['order' => $question['order']]);
        }

        return response()->json(['success' => true]);
    }
}
