<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\HrProject;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditLogService
{
    /**
     * Log an action.
     */
    public function log(
        HrProject $project,
        User $user,
        string $action,
        ?Model $model = null,
        ?array $changes = null
    ): AuditLog {
        return AuditLog::create([
            'hr_project_id' => $project->id,
            'user_id' => $user->id,
            'action' => $action,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model?->id,
            'changes' => $changes,
        ]);
    }

    /**
     * Log a model update with before/after changes.
     */
    public function logUpdate(
        HrProject $project,
        User $user,
        Model $model,
        array $oldAttributes,
        array $newAttributes
    ): AuditLog {
        $changes = [];
        
        foreach ($newAttributes as $key => $newValue) {
            $oldValue = $oldAttributes[$key] ?? null;
            if ($oldValue != $newValue) {
                $changes[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        return $this->log($project, $user, 'update', $model, $changes);
    }

    /**
     * Log a step status change.
     */
    public function logStepStatusChange(
        HrProject $project,
        User $user,
        string $step,
        string $oldStatus,
        string $newStatus
    ): AuditLog {
        return $this->log($project, $user, 'step_status_change', null, [
            'step' => $step,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);
    }
}
