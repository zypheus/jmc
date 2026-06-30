<?php

namespace Tests\Feature;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryPendingEmployee;
use App\Domain\Library\Models\LibraryPendingStudent;
use App\Domain\Library\Models\LibraryRoom;
use App\Domain\Library\Models\LibraryRoomReservation;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LibraryNavigationStatusTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_library_admin_receives_navigation_workload_counts(): void
    {
        $admin = $this->userWithRole('library_admin');
        $this->seedWorkload();

        $this->actingAs($admin)
            ->getJson(route('library.navigation.status'))
            ->assertOk()
            ->assertExactJson([
                'counts' => [
                    'pendingPatrons' => 3,
                    'pendingRooms' => 2,
                    'outstandingFines' => 2,
                ],
            ]);
    }

    public function test_navigation_counts_are_shared_with_the_library_dashboard(): void
    {
        $admin = $this->userWithRole('library_admin');
        $this->seedWorkload();

        $this->actingAs($admin)
            ->get(route('library.dashboard.admin'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/LibraryAdmin')
                ->where('stats.pendingCount', 3)
                ->where('stats.outstandingFinesCount', 2)
                ->where('libraryNavigationStatus.counts.pendingPatrons', 3)
                ->where('libraryNavigationStatus.counts.pendingRooms', 2)
                ->where('libraryNavigationStatus.counts.outstandingFines', 2)
                ->where('libraryNavigationStatus.refreshUrl', route('library.navigation.status'))
            );
    }

    public function test_library_staff_cannot_read_admin_workload_counts(): void
    {
        $staff = $this->userWithRole('library_staff');

        $this->actingAs($staff)
            ->getJson(route('library.navigation.status'))
            ->assertForbidden();

        $this->actingAs($staff)
            ->get(route('library.dashboard.staff'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/LibraryStaff')
                ->where('libraryNavigationStatus', null)
            );
    }

    public function test_guest_is_redirected_before_navigation_counts_are_exposed(): void
    {
        $this->get(route('library.navigation.status'))->assertRedirect(route('login'));
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function seedWorkload(): void
    {
        LibraryPendingStudent::query()->create(['firstname' => 'Ana', 'lastname' => 'One']);
        LibraryPendingStudent::query()->create(['firstname' => 'Ben', 'lastname' => 'Two']);
        LibraryPendingEmployee::query()->create([
            'firstname' => 'Cara',
            'lastname' => 'Three',
            'employee_id' => 'EMP-NAV-1',
        ]);

        $room = LibraryRoom::query()->create(['name' => 'Navigation Room', 'capacity' => 20]);
        foreach (['pending', 'pending', 'approved'] as $index => $status) {
            LibraryRoomReservation::query()->create([
                'room_id' => $room->id,
                'status' => $status,
                'date' => now()->addDays($index + 1)->toDateString(),
                'start_time' => '09:00:00',
                'end_time' => '10:00:00',
                'patron_email' => "room{$index}@test.test",
                'number_of_students' => 5,
            ]);
        }

        $this->createFineLog(25, 25);
        $this->createFineLog(10, null);
        $this->createFineLog(15, 15, now());
        $this->createFineLog(12, 12, null, 'Checked Out');
    }

    private function createFineLog(
        float $incurred,
        ?float $balance,
        mixed $clearedAt = null,
        string $status = 'Checked In',
    ): void {
        $book = LibraryBook::query()->create([
            'title_statement' => 'Navigation Test Book',
            'availability' => 'Available',
        ]);

        LibraryBookLog::query()->create([
            'book_id' => $book->id,
            'status' => $status,
            'circulation_type' => LibraryBookLog::CIRCULATION_CHECKOUT,
            'renew_count' => 0,
            'fine_incurred' => $incurred,
            'fine_balance' => $balance,
            'fine_cleared_at' => $clearedAt,
        ]);
    }
}
