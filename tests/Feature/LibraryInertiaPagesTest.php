<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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
            'employees index' => ['/employees', 'Library/Employees/Index'],
            'employees create' => ['/employees/create', 'Library/Employees/Create'],
            'pending queue' => ['/pending', 'Library/Pending/Index'],
            'circulation logs' => ['/logs', 'Library/Logs/Index'],
            'circulation policy' => ['/admin/circulation-policy', 'Library/Policy/Edit'],
            'outstanding fines' => ['/admin/fines/outstanding', 'Library/Fines/Outstanding'],
            'room pending' => ['/rooms/pending', 'Library/Rooms/Pending'],
            'room logs' => ['/rooms/logs', 'Library/Rooms/Logs'],
            'file repository' => ['/files', 'Library/Files/Index'],
            'edit requests' => ['/student/pending-requests', 'Library/Students/PendingRequests'],
            'catalog' => ['/books', 'Books/Index'],
            'ebooks index' => ['/ebooks', 'Library/Ebooks/Index'],
            'ebooks create' => ['/ebooks/create', 'Library/Ebooks/Create'],
            'catalog frameworks' => ['/admin/catalog-frameworks', 'Library/Admin/CatalogFrameworks/Index'],
            'catalog select options' => ['/admin/catalog-select-options', 'Library/Admin/CatalogSelectOptions/Index'],
            'activity feed' => ['/admin/activities', 'Library/Admin/Activities/Index'],
            'holdings report' => ['/reports/library-holdings', 'Library/Reports/Holdings'],
            'archived books' => ['/staff/books/archived', 'Library/Books/Archived'],
            'trash books' => ['/staff/books/trash', 'Library/Books/Trash'],
        ];
    }

    /** @dataProvider libraryAdminPagesProvider */
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

    public function test_library_staff_cannot_access_circulation_logs(): void
    {
        $user = User::factory()->create(['email' => 'lib-staff-inertia@test.test']);
        $user->assignRole('library_staff');

        $this->actingAs($user)->get('/logs')->assertForbidden();
    }
}
