<?php

namespace Tests\Feature;

use App\Domain\Attendance\Models\AttendanceFeedback;
use App\Domain\Attendance\Models\AttendanceSetting;
use App\Domain\Attendance\Models\AttendanceStudent;
use App\Domain\Library\Models\LibraryAttendanceSetting;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AttendanceAdminFeaturesTest extends TestCase
{
    use RefreshDatabase;

    /** @var list<string> */
    private array $uploadedFiles = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    protected function tearDown(): void
    {
        foreach ($this->uploadedFiles as $path) {
            if (is_file($path)) {
                unlink($path);
            }
        }

        parent::tearDown();
    }

    private function attendanceAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('attendance_admin');

        return $user;
    }

    private function student(array $attributes = []): AttendanceStudent
    {
        return AttendanceStudent::query()->create(array_merge([
            'firstname' => 'Jamie',
            'lastname' => 'Cruz',
            'qrcode' => 'ATT-'.fake()->unique()->numerify('########'),
        ], $attributes));
    }

    public function test_attendance_video_upload_updates_only_attendance_scanner_configuration(): void
    {
        LibraryAttendanceSetting::setLogoutFeedbackEnabled(false);

        $response = $this->actingAs($this->attendanceAdmin())->post('/attendance/upload-video', [
            'video' => UploadedFile::fake()->create('scanner.mp4', 1024, 'video/mp4'),
        ]);

        $response->assertRedirect();
        $path = AttendanceSetting::attendanceVideoUrl();
        $this->assertStringStartsWith('/videos/attendance-scanner-', $path);
        $this->assertSame('0', LibraryAttendanceSetting::query()->where('key', 'logout_feedback_enabled')->value('value'));

        $absolutePath = public_path(ltrim($path, '/'));
        $this->uploadedFiles[] = $absolutePath;
        $this->assertFileExists($absolutePath);

        $this->get('/attendance')->assertInertia(
            fn (Assert $page) => $page
                ->component('Attendance/Scan')
                ->where('attendanceVideoUrl', $path)
        );
    }

    public function test_attendance_video_upload_requires_an_mp4_within_the_size_limit(): void
    {
        $admin = $this->attendanceAdmin();

        $this->actingAs($admin)->post('/attendance/upload-video')->assertSessionHasErrors('video');
        $this->actingAs($admin)->post('/attendance/upload-video', [
            'video' => UploadedFile::fake()->create('scanner.webm', 1024, 'video/webm'),
        ])->assertSessionHasErrors('video');
        $this->actingAs($admin)->post('/attendance/upload-video', [
            'video' => UploadedFile::fake()->create('scanner.mp4', 512001, 'video/mp4'),
        ])->assertSessionHasErrors('video');

        $this->assertDatabaseMissing('attendance_settings', ['key' => AttendanceSetting::KEY_ATTENDANCE_VIDEO]);
    }

    public function test_logout_feedback_setting_controls_attendance_feedback_collection_only(): void
    {
        $admin = $this->attendanceAdmin();
        $student = $this->student();
        LibraryAttendanceSetting::setLogoutFeedbackEnabled(true);

        $this->actingAs($admin)->post('/attendance/logout-feedback', ['enabled' => '0'])
            ->assertSessionHasNoErrors();
        $this->postJson('/attendance-feedback', [
            'student_id' => $student->id,
            'rating' => 'excellent',
        ])->assertForbidden();

        $this->actingAs($admin)->post('/attendance/logout-feedback', ['enabled' => '1'])
            ->assertSessionHasNoErrors();
        $this->postJson('/attendance-feedback', [
            'student_id' => $student->id,
            'rating' => 'excellent',
        ])->assertOk();

        $this->assertDatabaseHas('attendance_feedback', [
            'student_id' => $student->id,
            'rating' => 'excellent',
            'declined' => false,
        ]);
        $this->assertTrue(LibraryAttendanceSetting::logoutFeedbackEnabled());
    }

    public function test_feedback_report_summarizes_filters_and_paginates_attendance_feedback(): void
    {
        $student = $this->student();
        AttendanceFeedback::query()->create(['student_id' => $student->id, 'rating' => 'excellent']);
        AttendanceFeedback::query()->create(['student_id' => $student->id, 'rating' => 'poor']);
        AttendanceFeedback::query()->create(['student_id' => $student->id, 'declined' => true]);

        $this->actingAs($this->attendanceAdmin())->get('/attendance/feedbacks?rating=excellent')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Attendance/Feedbacks/Index')
                ->where('summary.total', 3)
                ->where('summary.excellent', 1)
                ->where('summary.poor', 1)
                ->where('summary.declined', 1)
                ->where('filters.rating', 'excellent')
                ->has('feedbacks.data', 1)
                ->where('feedbacks.data.0.rating', 'excellent')
                ->has('feedbacks.links'));
    }
}
