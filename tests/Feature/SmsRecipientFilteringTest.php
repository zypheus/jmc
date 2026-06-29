<?php

namespace Tests\Feature;

use App\Domain\Attendance\Models\AttendanceStudent;
use App\Domain\Library\Models\LibraryStudent;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

class SmsRecipientFilteringTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        config([
            'services.sms_modem.url' => 'http://sms-modem.test/messages',
            'services.sms_modem.key' => 'shared-key',
        ]);
    }

    public function test_attendance_count_and_send_use_the_same_recipient_filters(): void
    {
        $user = User::factory()->create();
        $user->assignRole('attendance_staff');

        $this->attendanceStudent('S-00000001', 'BSIT', '1', '09170000001');
        $this->attendanceStudent('S-00000002', 'BSIT', '2', '09170000002');
        $this->attendanceStudent('S-00000003', 'BSBA', '1', '09170000003');

        $this->actingAs($user)
            ->get(route('attendance.sms.count', ['course' => 'BSIT', 'year' => '1']))
            ->assertOk()
            ->assertJson(['count' => 1]);

        Http::fake(['http://sms-modem.test/*' => Http::response(['queued' => true])]);

        $this->actingAs($user)->post(route('attendance.sms.send'), [
            'message' => 'Hello {name}',
            'course' => 'BSIT',
            'year' => '1',
        ])->assertSessionHas('success');

        Http::assertSent(function (Request $request): bool {
            $payload = json_decode($request->body(), true);

            return $request->url() === 'http://sms-modem.test/messages'
                && $request->hasHeader('X-API-KEY', 'shared-key')
                && count($payload) === 1
                && $payload[0]['number'] === '+639170000001';
        });
        Http::assertSentCount(1);
    }

    public function test_library_count_and_send_use_the_same_recipient_filters_and_shared_key(): void
    {
        $user = User::factory()->create();
        $user->assignRole('library_admin');

        $this->libraryStudent('L-00000001', 'BSIT', '1', '09180000001');
        $this->libraryStudent('L-00000002', 'BSIT', '2', '09180000002');
        $this->libraryStudent('L-00000003', 'BSBA', '1', '09180000003');

        $this->actingAs($user)
            ->get(route('library.sms.count', ['course' => 'BSIT', 'year' => '1']))
            ->assertOk()
            ->assertJson(['count' => 1]);

        Http::fake(['http://sms-modem.test/*' => Http::response(['queued' => true])]);

        $this->actingAs($user)->post(route('library.sms.send'), [
            'message' => 'Hello {name}',
            'course' => 'BSIT',
            'year' => '1',
        ])->assertSessionHas('success');

        Http::assertSent(function (Request $request): bool {
            $payload = json_decode($request->body(), true);

            return $request->hasHeader('X-API-KEY', 'shared-key')
                && count($payload) === 1
                && $payload[0]['number'] === '+639180000001';
        });
        Http::assertSentCount(1);
    }

    public function test_modem_response_body_is_not_written_to_logs(): void
    {
        $user = User::factory()->create();
        $user->assignRole('library_admin');
        $this->libraryStudent('L-00000004', 'BSIT', '1', '09180000004');

        Log::spy();
        Http::fake(['http://sms-modem.test/*' => Http::response('credential=must-not-leak', 500)]);

        $this->actingAs($user)->post(route('library.sms.send'), [
            'message' => 'Test',
            'course' => 'BSIT',
            'year' => '1',
        ])->assertSessionHas('error');

        Log::shouldHaveReceived('warning')
            ->once()
            ->with('SMS modem blast failed', Mockery::on(
                fn (array $context): bool => $context === ['status' => 500]
            ));
    }

    private function attendanceStudent(string $qrcode, string $course, string $year, string $mobile): AttendanceStudent
    {
        return AttendanceStudent::query()->create([
            'firstname' => 'Attendance',
            'lastname' => $qrcode,
            'qrcode' => $qrcode,
            'course' => $course,
            'year' => $year,
            'mobile_number' => $mobile,
        ]);
    }

    private function libraryStudent(string $qrcode, string $course, string $year, string $mobile): LibraryStudent
    {
        return LibraryStudent::query()->create([
            'firstname' => 'Library',
            'lastname' => $qrcode,
            'qrcode' => $qrcode,
            'course' => $course,
            'year' => $year,
            'mobile_number' => $mobile,
        ]);
    }
}
