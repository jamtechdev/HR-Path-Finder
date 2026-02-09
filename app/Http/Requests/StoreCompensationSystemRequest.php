<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompensationSystemRequest extends FormRequest
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
            'compensation_structure' => ['required', 'in:fixed,mixed,performance_based'],
            'incentive_types' => ['nullable', 'array'],
            'differentiation_logic' => ['nullable', 'string', 'max:255'],
        ];
    }
}
