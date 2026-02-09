<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CeoController extends Controller
{
    /**
     * Display CEO management page.
     */
    public function index(): Response
    {
        $ceos = User::role('ceo')->with('companies')->get();

        return Inertia::render('Admin/Ceo/Index', [
            'ceos' => $ceos,
        ]);
    }

    /**
     * Create a new CEO user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        ]);

        // Generate temporary password
        $temporaryPassword = Str::random(12);

        // Create CEO user
        $ceo = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($temporaryPassword),
            'email_verified_at' => now(),
        ]);

        // Assign CEO role
        $ceo->assignRole('ceo');

        return back()->with('success', "CEO created successfully. Temporary password: {$temporaryPassword}");
    }
}
