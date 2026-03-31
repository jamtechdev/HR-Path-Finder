<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Models\Setting;
use App\Notifications\CompanyInvitationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CeoController extends Controller
{
    /**
     * Display CEO management page.
     */
    public function index(): Response
    {
        $companies = Company::select('id', 'name')->orderBy('name')->get();

        $users = User::query()
            ->whereHas('roles', function ($query): void {
                $query->whereIn('name', ['ceo', 'hr_manager']);
            })
            ->with(['companies', 'roles'])
            ->orderByDesc('created_at')
            ->get([
                'id',
                'name',
                'email',
                'phone',
                'address',
                'city',
                'state',
                'latitude',
                'longitude',
                'profile_photo_path',
                'email_verified_at',
                'created_at',
                'access_granted_at',
            ]);

        $usersPayload = $users->map(function (User $user): array {
            $role = $user->hasRole('ceo') ? 'ceo' : 'hr_manager';
            $companyNames = $user->companies
                ->filter(function ($company) use ($role): bool {
                    return $company->pivot?->role === $role;
                })
                ->pluck('name')
                ->values()
                ->all();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'companyNames' => $companyNames,
                'phone' => $user->phone,
                'address' => $user->address,
                'city' => $user->city,
                'state' => $user->state,
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
                'profile_photo_url' => $user->profile_photo_path ? Storage::url($user->profile_photo_path) : null,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
                'access_granted_at' => $user->access_granted_at?->toIso8601String(),
            ];
        })->values()->all();

        $totalHrUsers = $users->filter(fn (User $u) => $u->hasRole('hr_manager'))->count();
        $totalCeoUsers = $users->filter(fn (User $u) => $u->hasRole('ceo'))->count();
        $pendingUsersCount = $users->filter(fn (User $u) => $u->access_granted_at === null)->count();

        return Inertia::render('Admin/Users/Index', [
            'users' => $usersPayload,
            'total_hr_users' => $totalHrUsers,
            'total_ceo_users' => $totalCeoUsers,
            'pending_users_count' => $pendingUsersCount,
            'companies' => $companies,
            'require_admin_approval' => Setting::getBool(
                'beta_require_admin_approval',
                (bool) env('BETA_REQUIRE_ADMIN_APPROVAL', false)
            ),
        ]);
    }

    /**
     * Create a new CEO user and optionally assign to company.
     */
    public function store(Request $request)
    {
        $request->validate([
            'role' => ['required', 'in:ceo,hr_manager'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'company_id' => ['nullable', 'exists:companies,id', 'required_without:company_name'],
            'company_name' => ['nullable', 'string', 'max:255', 'required_without:company_id'],
        ]);

        $requestedRole = $request->input('role', 'ceo');
        $requiresApproval = Setting::getBool(
            'beta_require_admin_approval',
            (bool) env('BETA_REQUIRE_ADMIN_APPROVAL', false)
        );

        $accessGrantedAt = $requiresApproval ? null : now();

        $user = User::query()->where('email', $request->email)->first();
        $temporaryPassword = 'changeMe@123';

        $isNew = $user === null;

        if ($isNew) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($temporaryPassword),
                'email_verified_at' => now(), // admin-created accounts are treated as verified
                'access_granted_at' => $accessGrantedAt,
            ]);
        } else {
            $user->fill([
                'name' => $request->name,
                'email' => $request->email,
                'email_verified_at' => now(),
            ]);

            if (! $requiresApproval) {
                // If admin approval is disabled, make sure the user is active.
                $user->access_granted_at = $user->access_granted_at ?? now();
            }

            $user->save();
        }

        // Ensure spatie role exists and sync to a single role.
        \Spatie\Permission\Models\Role::firstOrCreate(
            ['name' => $requestedRole, 'guard_name' => 'web']
        );
        $user->syncRoles([$requestedRole]);
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $company = null;
        if ($request->company_id) {
            $company = Company::findOrFail($request->company_id);
        } elseif ($request->company_name) {
            $company = Company::create([
                'name' => $request->company_name,
                'created_by' => $request->user()?->id,
            ]);
        }

        if ($company) {
            // Attach and set pivot role for this single company.
            $user->companies()->sync([$company->id => ['role' => $requestedRole]]);
        }

        $message = $isNew ? 'User created successfully.' : 'User updated successfully.';

        return back()->with('success', $message);
    }

    /**
     * Update admin editable profile fields for any non-admin user.
     */
    public function updateUser(Request $request, User $user)
    {
        if ($user->hasRole('admin')) {
            return back()->with('error', 'You cannot edit admin accounts.');
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $previousEmail = $user->email;

        $data = $request->validated();
        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
        ]);

        if ($request->hasFile('profile_photo')) {
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $user->profile_photo_path = $path;
        }

        // Admin edits should not lock the user out due to email verification.
        if ($previousEmail !== $user->email) {
            $user->email_verified_at = now();
        }

        $user->save();

        return back()->with('success', 'User profile updated successfully.');
    }

    /**
     * Toggle access for CEO/HR users from admin users page.
     */
    public function toggleAccess(Request $request, User $user): RedirectResponse
    {
        if ($user->hasRole('admin')) {
            return back()->with('error', 'You cannot change admin access.');
        }

        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $shouldBeActive = (bool) $validated['active'];
        $isCurrentlyActive = $user->access_granted_at !== null;

        if ($shouldBeActive === $isCurrentlyActive) {
            return back()->with('info', $shouldBeActive
                ? 'User is already active.'
                : 'User is already inactive.');
        }

        $user->forceFill([
            'access_granted_at' => $shouldBeActive ? now() : null,
        ])->save();

        return back()->with('success', $shouldBeActive
            ? "Access activated for {$user->email}."
            : "Access deactivated for {$user->email}.");
    }

    public function show(User $ceo)
    {
        $ceo->load('companies');

        return Inertia::render('Admin/Ceo/Show', [
            'ceo' => $ceo
        ]);
    }

    public function edit(User $ceo)
    {
        return Inertia::render('Admin/Ceo/Edit', [
            'ceo' => $ceo->load('companies'),
            'companies' => Company::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, User $ceo)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'company_id' => 'nullable|exists:companies,id'
        ]);

        $ceo->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->company_id) {
            $ceo->companies()->sync([$request->company_id]);
        }

        return redirect()->route('admin.ceo.index')
            ->with('success', 'CEO updated successfully');
    }

    public function destroy(User $ceo)
    {
        // company relation detach
        $ceo->companies()->detach();

        // delete user
        $ceo->delete();

        return redirect()->back()->with('success', 'CEO deleted successfully');
    }
}
