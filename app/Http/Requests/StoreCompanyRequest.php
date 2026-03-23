<?php

namespace App\Http\Requests;

use App\Models\Company;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreCompanyRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'registration_number' => ['nullable', 'string', 'max:255'],
            'hq_location' => ['nullable', 'string', 'max:255'],
            'public_listing_status' => ['required', 'in:public,private,not_applicable'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120'], // 5MB max
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'logo.image' => 'The logo must be an image file.',
            'logo.mimes' => 'The logo must be a file of type: jpeg, jpg, png, gif, or webp.',
            'logo.max' => 'The logo may not be greater than 5MB.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $user = $this->user();
            if (! $user) {
                return;
            }

            $name = trim((string) $this->input('name', ''));
            if ($name === '' || $v->errors()->has('name')) {
                return;
            }

            $minutes = max(1, (int) config('company.duplicate_name_window_minutes', 5));
            $normalized = mb_strtolower($name, 'UTF-8');

            $duplicate = Company::query()
                ->where('created_by', $user->id)
                ->where('created_at', '>=', now()->subMinutes($minutes))
                ->get()
                ->contains(fn (Company $c) => mb_strtolower(trim($c->name), 'UTF-8') === $normalized);

            if ($duplicate) {
                $v->errors()->add(
                    'name',
                    'A company with this name was created just now. If you already clicked Create, open your dashboard—otherwise wait a moment before trying again.'
                );
            }
        });
    }
}
