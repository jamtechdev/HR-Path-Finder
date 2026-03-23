<?php

use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'register-pass-10',
        'password_confirmation' => 'register-pass-10',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice', absolute: false));
});

test('registration rejects passwords shorter than ten characters', function () {
    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'short-pass@example.com',
        'password' => 'short',
        'password_confirmation' => 'short',
    ])->assertSessionHasErrors('password');

    $this->assertGuest();
});

test('registration duplicate email shows plain language message', function () {
    User::factory()->create(['email' => 'duplicate@example.com']);

    $this->post(route('register.store'), [
        'name' => 'Second User',
        'email' => 'duplicate@example.com',
        'password' => 'register-pass-10',
        'password_confirmation' => 'register-pass-10',
    ])
        ->assertSessionHasErrors('email');

    expect(session('errors')->get('email')[0])->toContain('already in use');
});
