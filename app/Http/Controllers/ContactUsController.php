<?php

namespace App\Http\Controllers;

use App\Models\ContactUsSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactUsController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Landing/Contact');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'manager_name' => ['required', 'string', 'max:255'],
            'manager_email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'inquiry' => ['required', 'string', 'max:5000'],
            'agreed_personal_information' => ['required', 'boolean'],
        ]);

        ContactUsSubmission::create($validated);

        return redirect()->route('contact')->with('success', 'Thanks! Your contact message has been received.');
    }
}

