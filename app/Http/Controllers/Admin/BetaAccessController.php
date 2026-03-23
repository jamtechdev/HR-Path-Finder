<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BetaAccessController extends Controller
{
    public function index(Request $request): Response
    {
        $pending = User::query()
            ->whereNull('access_granted_at')
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'email', 'email_verified_at', 'created_at']);

        return Inertia::render('Admin/BetaAccess/Index', [
            'pendingUsers' => $pending,
        ]);
    }

    public function approve(Request $request, User $user): RedirectResponse
    {
        if ($user->access_granted_at !== null) {
            return redirect()
                ->route('admin.beta-access.index')
                ->with('info', 'User already has access.');
        }

        $user->forceFill(['access_granted_at' => now()])->save();

        return redirect()
            ->route('admin.beta-access.index')
            ->with('success', "Access granted for {$user->email}.");
    }
}
