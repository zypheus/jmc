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

        return '/storage/'.ltrim($video->video_path, '/');
    }
}
