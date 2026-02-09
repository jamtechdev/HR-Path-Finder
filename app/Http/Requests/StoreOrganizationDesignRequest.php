<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrganizationDesignRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('hr_manager');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'structure_type' => ['required', 'in:functional,divisional,matrix,team,hq_subsidiary,undefined'],
            'job_grade_structure' => ['required', 'in:single,multi,integrated,separated'],
            'job_grade_details' => ['nullable', 'array'],
        ];
    }
}
