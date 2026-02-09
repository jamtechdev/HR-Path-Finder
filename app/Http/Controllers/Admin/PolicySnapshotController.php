<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PolicySnapshotQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PolicySnapshotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $questions = PolicySnapshotQuestion::orderBy('order')->orderBy('id')->get();

        return Inertia::render('Admin/PolicySnapshot/Index', [
            'questions' => $questions,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/PolicySnapshot/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'has_conditional_text' => ['nullable', 'boolean'],
        ]);

        $validated['order'] = $validated['order'] ?? PolicySnapshotQuestion::max('order') + 1;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['has_conditional_text'] = $validated['has_conditional_text'] ?? false;

        PolicySnapshotQuestion::create($validated);

        return redirect()->route('admin.policy-snapshot.index')
            ->with('success', 'Question created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PolicySnapshotQuestion $policySnapshotQuestion): Response
    {
        return Inertia::render('Admin/PolicySnapshot/Edit', [
            'question' => $policySnapshotQuestion,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PolicySnapshotQuestion $policySnapshotQuestion)
    {
        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'has_conditional_text' => ['nullable', 'boolean'],
        ]);

        $policySnapshotQuestion->update($validated);

        return redirect()->route('admin.policy-snapshot.index')
            ->with('success', 'Question updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PolicySnapshotQuestion $policySnapshotQuestion)
    {
        $policySnapshotQuestion->delete();

        return redirect()->route('admin.policy-snapshot.index')
            ->with('success', 'Question deleted successfully.');
    }
}
