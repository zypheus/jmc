<?php

namespace Tests\Feature;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryProgram;
use App\Domain\Library\Models\LibraryRoom;
use App\Domain\Library\Models\LibraryRoomReservation;
use App\Domain\Library\Models\LibraryStudent;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class LibraryInertiaPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    private function libraryAdmin(): User
    {
        $user = User::factory()->create(['email' => 'lib-admin-inertia@test.test']);
        $user->assignRole('library_admin');

        return $user;
    }

    /** @return array<string, array{0: string, 1: string}> */
    public static function libraryAdminPagesProvider(): array
    {
        return [
            'students index' => ['/students', 'Library/Students/Index'],
            'students create' => ['/students/create', 'Library/Students/Create'],
            'account settings' => ['/account', 'Library/Account/Edit'],
            'employees index' => ['/employees', 'Library/Employees/Index'],
            'employees create' => ['/employees/create', 'Library/Employees/Create'],
            'pending queue' => ['/pending', 'Library/Pending/Index'],
            'circulation logs' => ['/logs', 'Library/Logs/Index'],
            'circulation policy' => ['/admin/circulation-policy', 'Library/Policy/Edit'],
            'outstanding fines' => ['/admin/fines/outstanding', 'Library/Fines/Outstanding'],
            'room pending' => ['/rooms/pending', 'Library/Rooms/Pending'],
            'room logs' => ['/rooms/logs', 'Library/Rooms/Logs'],
            'library attendance logs' => ['/library/attendance/logs', 'Library/Attendance/Logs'],
            'library attendance reports hub' => ['/library/attendance/logs/reports', 'Library/Attendance/Reports/Hub'],
            'library attendance reports dashboard' => ['/library/attendance/logs/reports/dashboard', 'Library/Attendance/Reports/Dashboard'],
            'file repository' => ['/files', 'Library/Files/Index'],
            'edit requests' => ['/student/pending-requests', 'Library/Students/PendingRequests'],
            'catalog' => ['/books', 'Books/Index'],
            'catalog create' => ['/book/create', 'Library/Books/Create'],
            'open library import' => ['/catalog/copy/openlibrary', 'Library/Catalog/OpenLibrary/Search'],
            'ebooks index' => ['/ebooks', 'Library/Ebooks/Index'],
            'ebooks create' => ['/ebooks/create', 'Library/Ebooks/Create'],
            'catalog frameworks' => ['/admin/catalog-frameworks', 'Library/Admin/CatalogFrameworks/Index'],
            'catalog select options' => ['/admin/catalog-select-options', 'Library/Admin/CatalogSelectOptions/Index'],
            'activity feed' => ['/admin/activities', 'Library/Admin/Activities/Index'],
            'holdings report' => ['/reports/library-holdings', 'Library/Reports/Holdings'],
            'archived books' => ['/staff/books/archived', 'Library/Books/Archived'],
            'trash books' => ['/staff/books/trash', 'Library/Books/Trash'],
            'feedback administration' => ['/feedbacks', 'Library/Feedback/Index'],
            'prospectus administration' => ['/prospectus', 'Library/Prospectus/Index'],
            'rfid scanner' => ['/rfid-scanner', 'Library/Rfid/Scanner'],
            'room administration' => ['/rooms', 'Library/Rooms/Index'],
            'room creation' => ['/rooms/create', 'Library/Rooms/Create'],
            'sms blast' => ['/sms-blast', 'Library/Sms/Blast'],
            'scan sms settings' => ['/sms/scan-message', 'Library/Sms/ScanMessage'],
        ];
    }

    #[DataProvider('libraryAdminPagesProvider')]
    public function test_library_admin_can_load_inertia_pages(string $url, string $component): void
    {
        $response = $this->actingAs($this->libraryAdmin())->get($url);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component($component));
    }

    public function test_public_opac_landing_is_accessible(): void
    {
        $response = $this->get('/opac');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component('Opac/Landing'));
    }

    public function test_public_room_schedule_is_an_inertia_page(): void
    {
        $this->get('/rooms/schedule')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/Rooms/Schedule'));
    }

    public function test_open_library_review_renders_as_an_inertia_page(): void
    {
        Http::fake([
            'https://openlibrary.org/isbn/9780000000001.json' => Http::response([
                'title' => 'Imported Architecture',
                'publishers' => ['JMC Press'],
                'publish_date' => '2026',
            ]),
        ]);

        $this->actingAs($this->libraryAdmin())
            ->get(route('library.catalog.copy.openlibrary.search', ['isbn' => '9780000000001']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Library/Catalog/OpenLibrary/Review')
                ->where('record.title_statement', 'Imported Architecture')
            );
    }

    public function test_record_backed_legacy_pages_render_their_inertia_replacements(): void
    {
        $admin = $this->libraryAdmin();
        $book = LibraryBook::query()->create([
            'title_statement' => 'Architecture Consolidation',
            'availability' => 'Available',
            'accession_no' => 'ACC-0001',
        ]);
        $student = LibraryStudent::query()->create([
            'id_number' => '2026-1001',
            'firstname' => 'JMC',
            'lastname' => 'Student',
            'qrcode' => 'S-00001001',
        ]);
        $room = LibraryRoom::query()->create([
            'name' => 'Discussion Room',
            'capacity' => 8,
        ]);
        $reservation = LibraryRoomReservation::query()->create([
            'room_id' => $room->id,
            'status' => 'pending',
            'date' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'patron_email' => 'patron@jmc.test',
            'number_of_students' => 2,
        ]);

        foreach ([
            [route('library.book.show', $book), 'Library/Books/Show'],
            [route('library.book.edit', $book), 'Library/Books/Edit'],
            [route('library.students.show', $student), 'Library/Students/Show'],
            [route('library.rooms.edit', $room), 'Library/Rooms/Edit'],
        ] as [$url, $component]) {
            $response = $this->actingAs($admin)->get($url);

            $this->assertSame(200, $response->status(), "Expected [{$url}] to render [{$component}].");
            $response->assertInertia(fn (Assert $page) => $page->component($component));
        }

        $this->get(route('library.rooms.show', $reservation))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Public/Rooms/Show'));
    }

    public function test_prospectus_routes_accept_bound_program_models(): void
    {
        $admin = $this->libraryAdmin();
        $program = LibraryProgram::query()->create([
            'program_code' => 'BSIT',
            'program_name' => 'Bachelor of Science in Information Technology',
            'total_years' => 4,
        ]);

        $this->actingAs($admin)->post(route('library.prospectus.storeCourse', $program), [
            'year_level' => 1,
            'course_code' => 'IT101',
            'course_name' => 'Introduction to Computing',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('library_program_courses', [
            'program_id' => $program->id,
            'course_code' => 'IT101',
        ]);

        $this->actingAs($admin)
            ->get(route('library.prospectus.getProgramYears', $program))
            ->assertOk()
            ->assertJsonPath('years.0.year_level', 1);

        $this->actingAs($admin)
            ->get(route('library.ebooks.courses', $program))
            ->assertOk()
            ->assertJsonPath('0.name', 'Introduction to Computing');

        $this->actingAs($admin)
            ->get('/program/'.$program->id.'/courses')
            ->assertRedirect(route('library.ebooks.courses', $program));
    }

    public function test_library_staff_cannot_access_circulation_logs(): void
    {
        $user = User::factory()->create(['email' => 'lib-staff-inertia@test.test']);
        $user->assignRole('library_staff');

        $this->actingAs($user)->get('/logs')->assertForbidden();
    }
}
