<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryAttendanceSetting extends Model
{
    public const KEY_LOGOUT_FEEDBACK = 'logout_feedback_enabled';

    protected $table = 'library_attendance_settings';

    protected $fillable = [
        'key',
        'value',
    ];

    public static function logoutFeedbackEnabled(): bool
    {
        $value = static::query()->where('key', self::KEY_LOGOUT_FEEDBACK)->value('value');

        if ($value === null) {
            return true;
        }

        return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on'], true);
    }

    public static function setLogoutFeedbackEnabled(bool $enabled): void
    {
        static::query()->updateOrCreate(
            ['key' => self::KEY_LOGOUT_FEEDBACK],
            ['value' => $enabled ? '1' : '0']
        );
    }
}
