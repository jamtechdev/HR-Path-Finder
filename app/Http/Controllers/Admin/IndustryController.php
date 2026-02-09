<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IndustryCategory;
use App\Models\IndustrySubCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IndustryController extends Controller
{
    public function index(): Response
    {
        $categories = IndustryCategory::with('subCategories')->orderBy('order')->get();

        return Inertia::render('Admin/Industries/Index', [
            'categories' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'order' => $category->order ?? 0,
                    'subCategories' => $category->subCategories->map(function ($sub) {
                        return [
                            'id' => $sub->id,
                            'name' => $sub->name,
                            'order' => $sub->order ?? 0,
                        ];
                    })->toArray(),
                ];
            })->toArray(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Industries/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['order'] = $validated['order'] ?? IndustryCategory::max('order') + 1;

        IndustryCategory::create($validated);

        return redirect()->route('admin.industries.index')
            ->with('success', 'Industry category created successfully.');
    }

    public function edit(IndustryCategory $industry): Response
    {
        $industry->load('subCategories');
        
        return Inertia::render('Admin/Industries/Edit', [
            'category' => [
                'id' => $industry->id,
                'name' => $industry->name,
                'order' => $industry->order ?? 0,
                'subCategories' => $industry->subCategories->map(function ($sub) {
                    return [
                        'id' => $sub->id,
                        'name' => $sub->name,
                        'order' => $sub->order ?? 0,
                    ];
                })->toArray(),
            ],
        ]);
    }

    public function update(Request $request, IndustryCategory $industry)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $industry->update($validated);

        return redirect()->route('admin.industries.index')
            ->with('success', 'Industry category updated successfully.');
    }

    public function destroy(IndustryCategory $industry)
    {
        $industry->delete();

        return redirect()->route('admin.industries.index')
            ->with('success', 'Industry category deleted successfully.');
    }

    // Subcategory methods
    public function storeSubCategory(Request $request, IndustryCategory $industry)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['industry_category_id'] = $industry->id;
        $validated['order'] = $validated['order'] ?? IndustrySubCategory::where('industry_category_id', $industry->id)->max('order') + 1;

        IndustrySubCategory::create($validated);

        return redirect()->route('admin.industries.edit', $industry)
            ->with('success', 'Subcategory created successfully.');
    }

    public function updateSubCategory(Request $request, IndustrySubCategory $subCategory)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $subCategory->update($validated);

        return redirect()->route('admin.industries.edit', $subCategory->industryCategory)
            ->with('success', 'Subcategory updated successfully.');
    }

    public function destroySubCategory(IndustrySubCategory $subCategory)
    {
        $industry = $subCategory->industryCategory;
        $subCategory->delete();

        return redirect()->route('admin.industries.edit', $industry)
            ->with('success', 'Subcategory deleted successfully.');
    }
}
