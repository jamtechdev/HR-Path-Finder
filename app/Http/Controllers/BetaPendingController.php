<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BetaPendingController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if (! config('beta.require_admin_approval', false)) {
            return redirect()->route('dashboard');
        }

        $user = $request->user();
        if ($user?->access_granted_at) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/PendingApproval', [
            'requireAdminApproval' => true,
        ]);
    }
}
