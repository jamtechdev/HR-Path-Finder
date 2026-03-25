<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactUsSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactUsSubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $submissions = ContactUsSubmission::query()
            ->latest()
            ->limit(200)
            ->get();

        return Inertia::render('Admin/ContactUs/Index', [
            'submissions' => $submissions,
        ]);
    }
}

