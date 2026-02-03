<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/index');

    // Main settings page with tabs
    Route::get('settings/index', [\App\Http\Controllers\Settings\SettingsController::class, 'index'])->name('settings.index');
    
    // SMTP Settings
    Route::post('settings/smtp/update', [\App\Http\Controllers\Settings\SettingsController::class, 'updateSmtp'])->name('settings.smtp.update');
    Route::post('settings/smtp/test', [\App\Http\Controllers\Settings\SettingsController::class, 'testSmtp'])->name('settings.smtp.test');
    
    // Application Settings
    Route::post('settings/app/update', [\App\Http\Controllers\Settings\SettingsController::class, 'updateApp'])->name('settings.app.update');

    Route::get('settings/profile', function () {
        return redirect()->route('settings.index', ['tab' => 'profile']);
    })->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', function () {
        return redirect()->route('settings.index', ['tab' => 'password']);
    })->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return redirect()->route('settings.index', ['tab' => 'appearance']);
    })->name('appearance.edit');

    Route::get('settings/two-factor', function () {
        return redirect()->route('settings.index', ['tab' => 'security']);
    })->name('two-factor.show');
});
