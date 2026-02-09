<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IndustryCategory;
use App\Models\IndustrySubCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IndustrySubCategoryController extends Controller
{
    /**
     * Display a listing of subcategories.
     */
    public function index(Request $request): Response
    {
        $categoryId = $request->get('category');
        
        $query = IndustrySubCategory::with('industryCategory');
        
        if ($categoryId) {
            $query->where('industry_category_id', $categoryId);
        }
        
        $subCategories = $query->orderBy('industry_category_id')->orderBy('order')->get();
        $categories = IndustryCategory::orderBy('order')->get();

        return Inertia::render('Admin/Subcategories/Index', [
            'subCategories' => $subCategories->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'name' => $sub->name,
                    'order' => $sub->order ?? 0,
                    'industry_category_id' => $sub->industry_category_id,
                    'industryCategory' => $sub->industryCategory ? [
                        'id' => $sub->industryCategory->id,
                        'name' => $sub->industryCategory->name,
                    ] : null,
                ];
            })->toArray(),
            'categories' => $categories->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                ];
            })->toArray(),
            'currentCategory' => $categoryId ? (int) $categoryId : null,
        ]);
    }

    /**
     * Show the form for creating a new subcategory.
     */
    public function create(): Response
    {
        $categories = IndustryCategory::orderBy('order')->get();

        return Inertia::render('Admin/Subcategories/Create', [
            'categories' => $categories->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                ];
            })->toArray(),
        ]);
    }

    /**
     * Store a newly created subcategory.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'industry_category_id' => ['required', 'exists:industry_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Handle order - convert to integer or calculate default
        if (isset($validated['order']) && $validated['order'] !== '') {
            $validated['order'] = (int) $validated['order'];
        } else {
            $maxOrder = IndustrySubCategory::where('industry_category_id', $validated['industry_category_id'])->max('order');
            $validated['order'] = ($maxOrder !== null) ? $maxOrder + 1 : 0;
        }

        IndustrySubCategory::create($validated);

        return redirect()->route('admin.subcategories.index')
            ->with('success', 'Subcategory created successfully.');
    }

    /**
     * Show the form for editing the specified subcategory.
     */
    public function edit(IndustrySubCategory $subCategory): Response
    {
        $subCategory->load('industryCategory');
        $categories = IndustryCategory::orderBy('order')->get();

        return Inertia::render('Admin/Subcategories/Edit', [
            'subCategory' => [
                'id' => $subCategory->id,
                'name' => $subCategory->name,
                'order' => $subCategory->order ?? 0,
                'industry_category_id' => $subCategory->industry_category_id,
                'industryCategory' => $subCategory->industryCategory ? [
                    'id' => $subCategory->industryCategory->id,
                    'name' => $subCategory->industryCategory->name,
                ] : null,
            ],
            'categories' => $categories->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                ];
            })->toArray(),
        ]);
    }

    /**
     * Update the specified subcategory.
     */
    public function update(Request $request, IndustrySubCategory $subCategory)
    {
        $validated = $request->validate([
            'industry_category_id' => ['required', 'exists:industry_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Convert order to integer if provided, otherwise keep existing
        if (isset($validated['order'])) {
            $validated['order'] = (int) $validated['order'];
        } else {
            $validated['order'] = $subCategory->order ?? 0;
        }

        $subCategory->update($validated);

        return redirect()->route('admin.subcategories.index')
            ->with('success', 'Subcategory updated successfully.');
    }

    /**
     * Remove the specified subcategory.
     */
    public function destroy(IndustrySubCategory $subCategory)
    {
        $subCategory->delete();

        return redirect()->route('admin.subcategories.index')
            ->with('success', 'Subcategory deleted successfully.');
    }
}
