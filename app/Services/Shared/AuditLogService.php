<?php

declare(strict_types=1);

namespace App\Services\Shared;

use App\Domain\Library\Models\AdminActivity;
use Illuminate\Database\Eloquent\Model;

final class AuditLogService
{
    public function record(
        string $module,
        string $type,
        string $title,
        ?string $body = null,
        ?string $actionUrl = null,
        string $icon = 'info',
        ?Model $subject = null,
    ): AdminActivity {
        return AdminActivity::query()->create([
            'user_id' => auth()->id(),
            'module' => $module,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'action_url' => $actionUrl,
            'icon' => $icon,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
        ]);
    }
}
