<?php

namespace Tests\Feature;

use App\Domain\Library\Models\LibraryAttendanceVideo;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class LibraryAttendanceVideoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_uploaded_library_attendance_video_is_served_from_public_videos(): void
    {
        $user = User::factory()->create();
        $user->assignRole('library_admin');

        $response = $this->actingAs($user)->post('/library/attendance/video/upload', [
            'video' => UploadedFile::fake()->create('scanner.mp4', 1024, 'video/mp4'),
        ]);

        $response->assertRedirect(route('library.attendance.video'));

        $video = LibraryAttendanceVideo::current();
        $this->assertNotNull($video);
        $this->assertStringStartsWith('/videos/library-attendance-scanner-', $video->video_path);
        $this->assertSame($video->video_path, LibraryAttendanceVideo::currentUrl());
        $this->assertFileExists(public_path(ltrim($video->video_path, '/')));
    }

    public function test_legacy_storage_paths_still_resolve_to_storage_url(): void
    {
        LibraryAttendanceVideo::query()->create([
            'video_path' => 'library-attendance/videos/legacy.mp4',
        ]);

        $this->assertSame(
            '/storage/library-attendance/videos/legacy.mp4',
            LibraryAttendanceVideo::currentUrl()
        );
    }
}
