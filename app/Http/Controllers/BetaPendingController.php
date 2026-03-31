<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BetaPendingController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $requiresApproval = Setting::getBool(
            'beta_require_admin_approval',
            (bool) env('BETA_REQUIRE_ADMIN_APPROVAL', false)
        );

        if (! $requiresApproval) {
            return redirect()->route('dashboard');
        }

        $user = $request->user();

        if ($user?->hasRole('admin')) {
            return redirect()->route('dashboard');
        }
        if ($user?->access_granted_at) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/PendingApproval', [
            'requireAdminApproval' => true,
        ]);
    }
}
