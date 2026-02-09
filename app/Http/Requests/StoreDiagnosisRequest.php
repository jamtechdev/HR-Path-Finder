<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiagnosisRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'is_public' => ['nullable', 'boolean'],
            'registration_number' => ['nullable', 'string', 'max:255', function ($attribute, $value, $fail) {
                if ($value && !preg_match('/^(\d{3}-\d{2}-\d{5}|\d{10}|\d{3,10})$/', $value)) {
                    // Allow format: 000-00-00000, or 10 digits, or 3-10 digits
                    $fail('The registration number format is invalid. Use format: 000-00-00000 or enter digits only.');
                }
            }],
            'industry_category' => ['nullable', 'string', 'max:255'],
            'industry_subcategory' => ['nullable', 'string', 'max:255'],
            'industry_other' => ['nullable', 'string', 'max:255'],
            'present_headcount' => ['nullable', 'integer', 'min:0'],
            'expected_headcount_1y' => ['nullable', 'integer', 'min:0'],
            'expected_headcount_2y' => ['nullable', 'integer', 'min:0'],
            'expected_headcount_3y' => ['nullable', 'integer', 'min:0'],
            'average_tenure_active' => ['nullable', 'numeric', 'min:0'],
            'average_tenure_leavers' => ['nullable', 'numeric', 'min:0'],
            'average_age' => ['nullable', 'numeric', 'min:0'],
            'gender_male' => ['nullable', 'integer', 'min:0'],
            'gender_female' => ['nullable', 'integer', 'min:0'],
            'gender_other' => ['nullable', 'integer', 'min:0'],
            'total_executives' => ['nullable', 'integer', 'min:0'],
            'executive_positions' => ['nullable', 'array'],
            'leadership_count' => ['nullable', 'integer', 'min:0'],
            'job_grade_names' => ['nullable', 'array'],
            'promotion_years' => ['nullable', 'array'],
            'organizational_charts' => ['nullable', 'array'],
            'org_structure_types' => ['nullable', 'array'],
            'org_structure_explanations' => ['nullable', 'array'],
            'hr_issues' => ['nullable', 'array'],
            'custom_hr_issues' => ['nullable', 'string'],
            'job_categories' => ['nullable', 'array'],
            'job_functions' => ['nullable', 'array'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $presentHeadcount = $this->input('present_headcount', 0);
            $genderMale = $this->input('gender_male', 0);
            $genderFemale = $this->input('gender_female', 0);
            $genderOther = $this->input('gender_other', 0);
            
            $genderSum = $genderMale + $genderFemale + $genderOther;
            
            if ($presentHeadcount > 0 && $genderSum > $presentHeadcount) {
                $validator->errors()->add(
                    'gender_male',
                    "Gender sum ({$genderSum}) cannot exceed total workforce ({$presentHeadcount})"
                );
            }
        });
    }
}
