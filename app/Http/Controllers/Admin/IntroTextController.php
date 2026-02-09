<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IntroText;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntroTextController extends Controller
{
    public function index(): Response
    {
        $texts = IntroText::orderBy('key')->get();

        return Inertia::render('Admin/IntroTexts/Index', [
            'texts' => $texts,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/IntroTexts/Create', [
            'availableKeys' => [
                'ceo_survey_intro' => 'CEO Survey - Before You Begin',
                'hr_job_analysis_intro' => 'HR Job Analysis - Before You Begin',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'unique:intro_texts,key'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        IntroText::create($validated);

        return redirect()->route('admin.intro-texts.index')
            ->with('success', 'Intro text created successfully.');
    }

    public function edit(IntroText $introText): Response
    {
        return Inertia::render('Admin/IntroTexts/Edit', [
            'text' => $introText,
        ]);
    }

    public function update(Request $request, IntroText $introText)
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'unique:intro_texts,key,' . $introText->id],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $introText->update($validated);

        return redirect()->route('admin.intro-texts.index')
            ->with('success', 'Intro text updated successfully.');
    }

    public function destroy(IntroText $introText)
    {
        $introText->delete();

        return redirect()->route('admin.intro-texts.index')
            ->with('success', 'Intro text deleted successfully.');
    }
}
