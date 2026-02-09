<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register services for dependency injection
        $this->app->singleton(\App\Services\RecommendationService::class, function ($app) {
            return new \App\Services\RecommendationService(
                new \App\Data\RecommendationRules()
            );
        });

        $this->app->singleton(\App\Services\ValidationService::class);
        $this->app->singleton(\App\Services\CompanyWorkspaceService::class);
        $this->app->singleton(\App\Services\WorkflowStateService::class);
        $this->app->singleton(\App\Services\AuditLogService::class);
        $this->app->singleton(\App\Services\StepTransitionService::class);
        $this->app->singleton(\App\Services\DiagnosisSnapshotService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerPolicies();
    }

    protected function registerPolicies(): void
    {
        Gate::policy(\App\Models\HrProject::class, \App\Policies\HrProjectPolicy::class);
        Gate::policy(\App\Models\Diagnosis::class, \App\Policies\DiagnosisPolicy::class);
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
