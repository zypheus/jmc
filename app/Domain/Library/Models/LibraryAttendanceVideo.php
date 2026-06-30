<?php

namespace App\Domain\Library\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryAttendanceVideo extends Model
{
    public const DEFAULT_VIDEO_URL = '/videos/area51_product_slideshow.mp4';

    protected $table = 'library_attendance_videos';

    protected $fillable = [
        'video_path',
    ];

    public static function current(): ?self
    {
        return static::query()->orderByDesc('id')->first();
    }

    public static function currentUrl(): string
    {
        $video = static::current();

        if (! $video) {
            return self::DEFAULT_VIDEO_URL;
        }

        $path = $video->video_path;

        if (str_starts_with($path, '/videos/')) {
            return $path;
        }

        if (str_starts_with($path, 'videos/')) {
            return '/'.$path;
        }

        // Legacy uploads saved on the public disk before the path fix.
        return '/storage/'.ltrim($path, '/');
    }
}
