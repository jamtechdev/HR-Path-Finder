<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'hr_manager', 'guard_name' => 'web']);
});

test('manual email verification redirects hr manager to hr manager dashboard', function () {
    $user = User::factory()->unverified()->create();
    $user->assignRole('hr_manager');

    $this->actingAs($user)
        ->post(route('verification.manual'))
        ->assertRedirect(route('hr-manager.dashboard'));

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('duplicate company name within window returns validation error', function () {
    $user = User::factory()->create();
    $user->assignRole('hr_manager');

    $payload = [
        'name' => 'Duplicate Test Co',
        'public_listing_status' => 'private',
    ];

    $this->actingAs($user)
        ->post('/hr-manager/companies', $payload)
        ->assertRedirect();

    $this->actingAs($user)
        ->from('/hr-manager/companies/create')
        ->post('/hr-manager/companies', $payload)
        ->assertSessionHasErrors('name');
});

test('beta middleware sends users without access grant to pending approval page', function () {
    config(['beta.require_admin_approval' => true]);

    $user = User::factory()->withoutAccessGrant()->create();
    $user->assignRole('hr_manager');

    $this->actingAs($user)
        ->get(route('hr-manager.dashboard'))
        ->assertRedirect(route('beta.pending'));
});

test('shared inertia flash includes warning from session', function () {
    $user = User::factory()->create();
    $user->assignRole('hr_manager');

    $this->actingAs($user)
        ->withSession(['warning' => 'Check your inbox'])
        ->get(route('hr-manager.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('flash.warning', 'Check your inbox'));
});
