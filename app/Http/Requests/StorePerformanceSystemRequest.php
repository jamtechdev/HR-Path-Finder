<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePerformanceSystemRequest extends FormRequest
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
            'evaluation_unit' => ['required', 'in:individual,organization,hybrid'],
            'performance_method' => ['required', 'in:kpi,mbo,okr,bsc'],
            'evaluation_logic' => ['required', 'in:quantitative,qualitative,mixed'],
        ];
    }
}
