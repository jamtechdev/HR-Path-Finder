<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HrIssue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HrIssueController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->get('category');
        $query = HrIssue::query();

        if ($category) {
            $query->where('category', $category);
        }

        $issues = $query->orderBy('order')->orderBy('id')->get();

        return Inertia::render('Admin/HrIssues/Index', [
            'issues' => $issues,
            'categories' => [
                'recruitment_retention' => 'Recruitment / Retention',
                'organization' => 'Organization',
                'culture_leadership' => 'Culture / Leadership',
                'evaluation_compensation' => 'Evaluation / Compensation',
                'upskilling' => 'Upskilling',
                'others' => 'Others',
            ],
            'currentCategory' => $category,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/HrIssues/Create', [
            'categories' => [
                'recruitment_retention' => 'Recruitment / Retention',
                'organization' => 'Organization',
                'culture_leadership' => 'Culture / Leadership',
                'evaluation_compensation' => 'Evaluation / Compensation',
                'upskilling' => 'Upskilling',
                'others' => 'Others',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['order'] = $validated['order'] ?? HrIssue::where('category', $validated['category'])->max('order') + 1;
        $validated['is_active'] = $validated['is_active'] ?? true;

        HrIssue::create($validated);

        return redirect()->route('admin.hr-issues.index', ['category' => $validated['category']])
            ->with('success', 'HR Issue created successfully.');
    }

    public function edit(HrIssue $hrIssue): Response
    {
        return Inertia::render('Admin/HrIssues/Edit', [
            'issue' => $hrIssue,
            'categories' => [
                'recruitment_retention' => 'Recruitment / Retention',
                'organization' => 'Organization',
                'culture_leadership' => 'Culture / Leadership',
                'evaluation_compensation' => 'Evaluation / Compensation',
                'upskilling' => 'Upskilling',
                'others' => 'Others',
            ],
        ]);
    }

    public function update(Request $request, HrIssue $hrIssue)
    {
        $validated = $request->validate([
            'category' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $hrIssue->update($validated);

        return redirect()->route('admin.hr-issues.index', ['category' => $validated['category']])
            ->with('success', 'HR Issue updated successfully.');
    }

    public function destroy(HrIssue $hrIssue)
    {
        $category = $hrIssue->category;
        $hrIssue->delete();

        return redirect()->route('admin.hr-issues.index', ['category' => $category])
            ->with('success', 'HR Issue deleted successfully.');
    }
}
