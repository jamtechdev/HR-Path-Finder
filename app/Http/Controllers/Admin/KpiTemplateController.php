<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KpiTemplate;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KpiTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = KpiTemplate::with('company')->orderBy('company_id')->orderBy('org_unit_name')->orderBy('sort_order');
        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        if ($request->filled('org_unit_name')) {
            $query->whereRaw('TRIM(LOWER(org_unit_name)) LIKE ?', ['%' . strtolower(trim($request->org_unit_name)) . '%']);
        }
        $templates = $query->paginate(10)->withQueryString();
        $companies = Company::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Admin/KpiTemplates/Index', [
            'templates' => $templates,
            'companies' => $companies,
        ]);
    }

    public function create()
    {
        $companies = Company::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Admin/KpiTemplates/Create', ['companies' => $companies]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => ['nullable', 'exists:companies,id'],
            'org_unit_name' => ['nullable', 'string', 'max:255'],
            'kpi_name' => ['required', 'string', 'max:255'],
            'purpose' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'formula' => ['nullable', 'string'],
            'measurement_method' => ['nullable', 'string'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['company_id'] = $request->filled('company_id') ? $validated['company_id'] : null;
        KpiTemplate::create($validated);
        return redirect()->route('admin.kpi-templates.index')->with('success', 'KPI template created.');
    }

    public function edit(KpiTemplate $kpiTemplate)
    {
        $kpiTemplate->load('company');
        $companies = Company::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Admin/KpiTemplates/Edit', [
            'template' => $kpiTemplate,
            'companies' => $companies,
        ]);
    }

    public function update(Request $request, KpiTemplate $kpiTemplate)
    {
        $validated = $request->validate([
            'company_id' => ['nullable', 'exists:companies,id'],
            'org_unit_name' => ['nullable', 'string', 'max:255'],
            'kpi_name' => ['required', 'string', 'max:255'],
            'purpose' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'formula' => ['nullable', 'string'],
            'measurement_method' => ['nullable', 'string'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['company_id'] = $request->filled('company_id') ? $validated['company_id'] : null;
        $kpiTemplate->update($validated);
        return redirect()->route('admin.kpi-templates.index')->with('success', 'KPI template updated.');
    }

    public function destroy(KpiTemplate $kpiTemplate)
    {
        $kpiTemplate->delete();
        return redirect()->route('admin.kpi-templates.index')->with('success', 'KPI template deleted.');
    }
}
