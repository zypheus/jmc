<?php

namespace App\Domain\Attendance\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceSetting extends Model
{
    public const KEY_LOGOUT_FEEDBACK = 'logout_feedback_enabled';

    public const KEY_SECTION_PICKER = 'section_picker_enabled';

    public const KEY_ATTENDANCE_SECTIONS = 'attendance_sections';

    public const KEY_SCAN_SMS = 'scan_sms';

    public const KEY_ATTENDANCE_VIDEO = 'attendance_video_path';

    public const DEFAULT_ATTENDANCE_SECTIONS = [
        'Circulation Section',
        'Reference Section',
        'Serials Section',
        'Filipiniana Section',
        'Discussion Room',
        'Audio Visual Room',
        'Learning Commons',
        'Biblionook',
    ];

    protected $table = 'attendance_settings';

    protected $fillable = ['key', 'value'];

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
        static::updateOrCreate(
            ['key' => self::KEY_LOGOUT_FEEDBACK],
            ['value' => $enabled ? '1' : '0']
        );
    }

    public static function sectionPickerEnabled(): bool
    {
        $value = static::query()->where('key', self::KEY_SECTION_PICKER)->value('value');

        if ($value === null) {
            return true;
        }

        return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on'], true);
    }

    public static function setSectionPickerEnabled(bool $enabled): void
    {
        static::updateOrCreate(
            ['key' => self::KEY_SECTION_PICKER],
            ['value' => $enabled ? '1' : '0']
        );
    }

    /** @return list<string> */
    public static function attendanceSections(): array
    {
        $raw = static::query()->where('key', self::KEY_ATTENDANCE_SECTIONS)->value('value');

        if ($raw === null) {
            return self::DEFAULT_ATTENDANCE_SECTIONS;
        }

        $decoded = json_decode($raw, true);
        if (! is_array($decoded)) {
            return self::DEFAULT_ATTENDANCE_SECTIONS;
        }

        $sections = array_values(array_unique(array_filter(array_map(
            fn ($name) => trim((string) $name),
            $decoded
        ))));

        return $sections !== [] ? $sections : self::DEFAULT_ATTENDANCE_SECTIONS;
    }

    /** @param  list<string>  $sections */
    public static function setAttendanceSections(array $sections): void
    {
        $sections = array_values(array_unique(array_filter(array_map(
            fn ($name) => trim((string) $name),
            $sections
        ))));

        static::updateOrCreate(
            ['key' => self::KEY_ATTENDANCE_SECTIONS],
            ['value' => json_encode($sections, JSON_UNESCAPED_UNICODE)]
        );
    }

    public static function scanSmsTemplate(): string
    {
        return static::query()->where('key', self::KEY_SCAN_SMS)->value('value')
            ?? 'Hello {name}, you scanned {status} at the library at {time}.';
    }

    public static function setScanSmsTemplate(string $message): void
    {
        static::updateOrCreate(
            ['key' => self::KEY_SCAN_SMS],
            ['value' => $message]
        );
    }

    public static function attendanceVideoUrl(): string
    {
        return static::query()->where('key', self::KEY_ATTENDANCE_VIDEO)->value('value')
            ?? '/videos/area51_product_slideshow.mp4';
    }

    public static function setAttendanceVideoPath(string $path): void
    {
        static::updateOrCreate(
            ['key' => self::KEY_ATTENDANCE_VIDEO],
            ['value' => $path]
        );
    }
}
