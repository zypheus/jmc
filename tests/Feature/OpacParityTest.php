<?php

namespace Tests\Feature;

use App\Domain\Library\Mail\BookReservationReadyMail;
use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookLog;
use App\Domain\Library\Models\LibraryBookReservation;
use App\Domain\Library\Models\LibraryCatalogFramework;
use App\Domain\Library\Models\LibraryCatalogFrameworkField;
use App\Domain\Library\Models\LibraryEbook;
use App\Domain\Library\Models\LibraryEmployee;
use App\Domain\Library\Models\LibraryFineSetting;
use App\Domain\Library\Models\LibraryMarcField;
use App\Domain\Library\Models\LibrarySetting;
use App\Domain\Library\Models\LibraryStudent;
use App\Domain\Library\Support\LoanDueDate;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OpacParityTest extends TestCase
{
    use RefreshDatabase;

    public function test_grouped_catalog_search_exposes_facets_and_excludes_archived_copies(): void
    {
        $this->book([
            'title_statement' => 'Algorithms for Libraries',
            'main_author' => 'Ada Reader',
            'pub_year' => '2026',
            'section' => 'Circulation',
            'subject_topic' => 'Computer science',
            'genre' => 'Reference',
            'content_type' => 'Text',
            'course' => 'BSIT',
            'availability' => 'Available',
        ]);
        $this->book([
            'title_statement' => 'Algorithms for Libraries',
            'main_author' => 'Ada Reader',
            'pub_year' => '2026',
            'section' => 'Circulation',
            'subject_topic' => 'Computer science',
            'genre' => 'Reference',
            'content_type' => 'Text',
            'course' => 'BSIT',
            'availability' => 'Borrowed',
        ]);
        $archived = $this->book([
            'title_statement' => 'Algorithms for Libraries',
            'main_author' => 'Ada Reader',
            'pub_year' => '2026',
            'section' => 'Circulation',
            'subject_topic' => 'Computer science',
            'genre' => 'Reference',
            'content_type' => 'Text',
            'course' => 'BSIT',
        ]);
        $archived->forceFill(['archived_at' => now()])->save();

        $this->get('/opac?search=Algorithms&section=Circulation&subject_topic=Computer%20science&genre=Reference&content_type=Text&course=BSIT')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Opac/Landing')
                ->where('libraryBooks.total', 1)
                ->where('libraryBooks.data.0.copies', 2)
                ->where('libraryBooks.data.0.is_available', 1)
                ->where('filters.section', 'Circulation')
                ->where('filters.subjectTopic', 'Computer science')
                ->where('filters.genre', 'Reference')
                ->where('filters.contentType', 'Text')
                ->where('filters.course', 'BSIT'));
    }

    public function test_public_record_details_group_holdings_and_descriptive_fields(): void
    {
        $framework = LibraryCatalogFramework::create(['name' => 'Books']);
        $marcField = LibraryMarcField::create([
            'tag' => '020',
            'subfield' => 'a',
            'label' => 'ISBN',
            'repeatable' => false,
            'input_type' => 'text',
        ]);
        LibraryCatalogFrameworkField::create([
            'framework_id' => $framework->id,
            'marc_field_id' => $marcField->id,
            'visible' => true,
            'required' => false,
            'sort_order' => 1,
            'book_column' => 'isbn',
        ]);

        $first = $this->book([
            'title_statement' => 'Cataloging in Practice',
            'main_author' => 'Mara Fields',
            'pub_year' => '2025',
            'isbn' => '978-1-23-456789-0',
            'pages' => '240',
            'illustrations' => 'illustrations',
            'size' => '24',
            'library_name' => 'Academic Library',
            'section' => 'General Collection',
        ]);
        $this->book([
            'title_statement' => 'Cataloging in Practice',
            'main_author' => 'Mara Fields',
            'pub_year' => '2025',
            'isbn' => '978-1-23-456789-0',
            'library_name' => 'Academic Library',
            'section' => 'General Collection',
            'availability' => 'Borrowed',
        ]);

        $this->getJson(route('library.opac.book.details', $first))
            ->assertOk()
            ->assertJsonPath('group.title', 'Cataloging in Practice')
            ->assertJsonPath('description.isbn', '978-1-23-456789-0')
            ->assertJsonCount(2, 'copies')
            ->assertJsonPath('copies.0.shelving_location', 'Academic Library — General Collection')
            ->assertJsonPath('marc_view_rows.0.label', '020 ‡a (ISBN)');

        $this->get('/books/copies?title=Cataloging%20in%20Practice&author=Mara%20Fields&year=2025')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Opac/Copies')
                ->where('copies.total', 2));
    }

    public function test_ebook_search_returns_the_digital_collection(): void
    {
        LibraryEbook::create([
            'title' => 'Digital Research Methods',
            'author' => 'Elena Cruz',
            'publication_year' => '2026',
            'source' => 'JMC Repository',
            'link' => 'https://example.test/ebook',
        ]);

        $this->get('/opac?view=ebooks&search=Digital')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Opac/Landing')
                ->where('filters.viewMode', 'ebooks')
                ->where('libraryEbooks.total', 1)
                ->where('libraryEbooks.data.0.title', 'Digital Research Methods'));
    }

    public function test_reservations_support_students_employees_and_student_first_token_resolution(): void
    {
        Mail::fake();

        $student = $this->student('SHARED-100', 'student-qr', 'student@example.test');
        $employee = $this->employee('SHARED-100', 'employee-qr');
        $studentBook = $this->book(['availability' => 'Available']);
        $employeeBook = $this->book(['availability' => 'Borrowed']);

        $this->postJson('/opac/reserve', [
            'patron_token' => 'SHARED-100',
            'book_id' => $studentBook->id,
        ])->assertOk()->assertJsonPath('reservation.patron.type', 'student');

        $this->assertDatabaseHas('library_book_reservations', [
            'book_id' => $studentBook->id,
            'student_id' => $student->id,
            'employee_id' => null,
            'status' => LibraryBookReservation::STATUS_READY,
        ]);
        $this->assertNotNull(LibraryBookReservation::where('book_id', $studentBook->id)->value('ready_notified_at'));
        Mail::assertSent(BookReservationReadyMail::class);

        $this->postJson('/opac/reserve', [
            'patron_token' => 'employee-qr',
            'book_id' => $employeeBook->id,
        ])->assertOk()->assertJsonPath('reservation.patron.type', 'employee');

        $this->assertDatabaseHas('library_book_reservations', [
            'book_id' => $employeeBook->id,
            'student_id' => null,
            'employee_id' => $employee->id,
            'status' => LibraryBookReservation::STATUS_PENDING,
        ]);

        $this->get(route('library.employee.qr.profile', 'employee-qr'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Library/Kiosk/EmployeeProfile')
                ->where('pendingReservations.0.book.title_statement', $employeeBook->title_statement));
    }

    public function test_employee_can_checkout_owned_hold_and_another_patron_cannot(): void
    {
        $this->fineSettings();

        $employee = $this->employee('EMP-900', 'emp-900-qr');
        $student = $this->student('STU-900', 'stu-900-qr');
        $book = $this->book(['availability' => 'Available']);

        $this->postJson('/opac/reserve', [
            'patron_token' => $employee->employee_id,
            'book_id' => $book->id,
        ])->assertOk();

        $this->postJson('/checkout/process', [
            'patron_token' => $student->id_number,
            'books' => [['id' => $book->id]],
        ])->assertStatus(422);

        $this->postJson('/checkout/process', [
            'patron_token' => $employee->employee_id,
            'books' => [['id' => $book->id]],
        ])->assertOk()
            ->assertJsonPath('patron.type', 'employee')
            ->assertJsonPath('books.0.id', $book->id);

        $this->assertDatabaseHas('library_book_logs', [
            'book_id' => $book->id,
            'student_id' => null,
            'employee_id' => $employee->id,
            'status' => 'Checked Out',
        ]);
        $this->assertDatabaseHas('library_book_reservations', [
            'book_id' => $book->id,
            'employee_id' => $employee->id,
            'status' => LibraryBookReservation::STATUS_FULFILLED,
        ]);
        $this->assertSame('Borrowed', $book->fresh()->availability);

        $log = LibraryBookLog::where('book_id', $book->id)->latest('id')->firstOrFail();
        $this->assertSame(
            LoanDueDate::addBusinessDays(now('Asia/Manila'), 14)->toDateString(),
            $log->due_date?->toDateString(),
        );
    }

    public function test_legacy_student_id_request_alias_still_checks_out_students(): void
    {
        $this->fineSettings();
        $student = $this->student('STU-LEGACY', 'legacy-qr');
        $book = $this->book(['availability' => 'Available']);

        $this->postJson('/checkout/process', [
            'student_id' => $student->id_number,
            'book_id' => $book->id,
        ])->assertOk()
            ->assertJsonPath('student.id_number', $student->id_number)
            ->assertJsonPath('library_books.0.id', $book->id);
    }

    public function test_room_use_copy_cannot_be_reserved_and_overdue_patron_cannot_checkout(): void
    {
        $this->fineSettings();
        $employee = $this->employee('EMP-BLOCKED', 'emp-blocked-qr');
        $roomUseBook = $this->book(['reserved' => true]);

        $this->postJson('/opac/reserve', [
            'patron_token' => $employee->employee_id,
            'book_id' => $roomUseBook->id,
        ])->assertStatus(422)
            ->assertJsonPath('message', 'This copy is for room use only and cannot be reserved for checkout.');

        $overdueBook = $this->book(['availability' => 'Borrowed']);
        LibraryBookLog::create([
            'book_id' => $overdueBook->id,
            'employee_id' => $employee->id,
            'patron_name' => 'Patron, Employee',
            'status' => 'Checked Out',
            'circulation_type' => LibraryBookLog::CIRCULATION_CHECKOUT,
            'renew_count' => 0,
            'timestamp' => now()->subDays(10),
            'due_date' => now()->subDay(),
            'fine_incurred' => 0,
        ]);

        $nextBook = $this->book();
        $this->postJson('/checkout/process', [
            'patron_token' => $employee->employee_id,
            'books' => [['id' => $nextBook->id]],
        ])->assertStatus(422)
            ->assertJsonPath('message', 'Checkout blocked: this patron has overdue book(s).');
    }

    public function test_stale_employee_hold_expires_and_releases_the_copy(): void
    {
        LibrarySetting::setReservationHoldDays(1);
        $employee = $this->employee('EMP-EXPIRE', 'emp-expire-qr');
        $book = $this->book(['availability' => 'On Hold']);

        $reservation = LibraryBookReservation::create([
            'book_id' => $book->id,
            'student_id' => null,
            'employee_id' => $employee->id,
            'status' => LibraryBookReservation::STATUS_READY,
            'reserved_at' => now('Asia/Manila')->subDays(3),
            'ready_at' => now('Asia/Manila')->subDays(3),
        ]);

        $this->assertSame(1, LibraryBookReservation::runExpiry());
        $this->assertSame(LibraryBookReservation::STATUS_CANCELLED, $reservation->fresh()->status);
        $this->assertSame('Available', $book->fresh()->availability);
    }

    public function test_bulk_checkout_enforces_the_five_copy_public_cart_limit(): void
    {
        $this->fineSettings();
        $student = $this->student('STU-LIMIT', 'stu-limit-qr');
        $bookIds = collect(range(1, 6))->map(fn () => $this->book()->id)->all();

        $this->postJson('/checkout/bulk', [
            'patron_token' => $student->id_number,
            'book_ids' => $bookIds,
        ])->assertStatus(422)
            ->assertJsonValidationErrors('book_ids');
    }

    public function test_staff_circulation_prefills_an_employee_who_owns_a_ready_hold(): void
    {
        $this->seed(RoleSeeder::class);
        $admin = User::factory()->create(['email' => 'opac-admin@example.test']);
        $admin->assignRole('library_admin');

        $employee = $this->employee('EMP-PREFILL', 'emp-prefill-qr');
        $book = $this->book(['availability' => 'Available']);
        $this->postJson('/opac/reserve', [
            'patron_token' => $employee->employee_id,
            'book_id' => $book->id,
        ])->assertOk();

        $this->actingAs($admin)
            ->get('/logs?copy_identifier='.urlencode($book->accession_no))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Library/Logs/Index')
                ->where('prefill.employeeId', $employee->id)
                ->where('prefill.studentId', null)
                ->where('prefill.patronLabel', 'Patron, Employee'));
    }

    private function book(array $overrides = []): LibraryBook
    {
        static $copy = 0;
        $copy++;

        return LibraryBook::create(array_merge([
            'title_statement' => "OPAC Test Book {$copy}",
            'main_author' => 'Test Author',
            'pub_year' => '2026',
            'accession_no' => "OPAC-{$copy}",
            'barcode' => "BAR-{$copy}",
            'availability' => 'Available',
            'reserved' => false,
            'content_type' => 'Text',
        ], $overrides));
    }

    private function student(string $id, string $qr, ?string $email = null): LibraryStudent
    {
        return LibraryStudent::create([
            'id_number' => $id,
            'qrcode' => $qr,
            'firstname' => 'Student',
            'lastname' => 'Patron',
            'course' => 'BSIT',
            'email' => $email,
        ]);
    }

    private function employee(string $id, string $qr): LibraryEmployee
    {
        return LibraryEmployee::create([
            'employee_id' => $id,
            'qrcode' => $qr,
            'firstname' => 'Employee',
            'lastname' => 'Patron',
            'department' => 'Library',
        ]);
    }

    private function fineSettings(): void
    {
        LibraryFineSetting::create([
            'fine_per_day' => 5,
            'max_fine' => 500,
            'grace_period_days' => 0,
            'loan_duration_days' => 7,
            'student_loan_duration_days' => 7,
            'employee_loan_duration_days' => 14,
            'effective_from' => now()->toDateString(),
        ]);
    }
}
