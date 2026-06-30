<?php

use App\Http\Controllers\Auth\DashboardController;
use App\Http\Controllers\Library\AdminActivityController;
use App\Http\Controllers\Library\BookController;
use App\Http\Controllers\Library\BookImportController;
use App\Http\Controllers\Library\BookLogController;
use App\Http\Controllers\Library\BookReservationController;
use App\Http\Controllers\Library\CatalogFrameworkAdminController;
use App\Http\Controllers\Library\CatalogMarcSelectOptionsController;
use App\Http\Controllers\Library\CheckoutController;
use App\Http\Controllers\Library\CirculationPolicyController;
use App\Http\Controllers\Library\EbookController;
use App\Http\Controllers\Library\EmployeeController;
use App\Http\Controllers\Library\EmployeeIdCardController;
use App\Http\Controllers\Library\ExportController;
use App\Http\Controllers\Library\FeedbackController;
use App\Http\Controllers\Library\FileController;
use App\Http\Controllers\Library\FineClearanceController;
use App\Http\Controllers\Library\HolidayController;
use App\Http\Controllers\Library\IdCardController;
use App\Http\Controllers\Library\LibraryAttendanceController;
use App\Http\Controllers\Library\LibraryAttendanceFeedbackController;
use App\Http\Controllers\Library\LibraryAttendanceVideoController;
use App\Http\Controllers\Library\LibraryHoldingsReportController;
use App\Http\Controllers\Library\LibraryKioskController;
use App\Http\Controllers\Library\LibraryNavigationStatusController;
use App\Http\Controllers\Library\OpenLibraryCopyCatalogController;
use App\Http\Controllers\Library\PendingEmployeeController;
use App\Http\Controllers\Library\PendingStudentController;
use App\Http\Controllers\Library\ProspectusController;
use App\Http\Controllers\Library\RFIDScanController;
use App\Http\Controllers\Library\RoomController;
use App\Http\Controllers\Library\RoomReservationController;
use App\Http\Controllers\Library\SMSController;
use App\Http\Controllers\Library\StudentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard/library-admin', [DashboardController::class, 'libraryAdmin'])
        ->middleware('library.admin')
        ->name('library.dashboard.admin');

    Route::get('/dashboard/library-staff', [DashboardController::class, 'libraryStaff'])
        ->middleware('library.access')
        ->name('library.dashboard.staff');
});

Route::prefix('register/library')->name('library.register.')->group(function (): void {
    Route::get('/', [PendingStudentController::class, 'create'])->name('student.form');
    Route::get('/employee', [PendingEmployeeController::class, 'create'])->name('employee.form');
    Route::post('/', [PendingStudentController::class, 'store'])->name('student.store');
    Route::post('/employee', [PendingEmployeeController::class, 'store'])->name('employee.store');
});

Route::get('/filter/years', [BookController::class, 'getYears'])->name('library.filters.years');
Route::get('/filter/courses', [BookController::class, 'getCourses'])->name('library.filters.courses');
Route::get('/books/copies', [BookController::class, 'viewCopies'])->name('library.books.copies');
Route::get('/feedback', [FeedbackController::class, 'create'])->name('library.feedback.create');
Route::post('/feedback', [FeedbackController::class, 'store'])->name('library.feedback.store');
Route::get('/student/qr/{qrcode}', [LibraryKioskController::class, 'studentProfile'])->name('library.student.qr.profile');
Route::get('/employee/qr/{qrcode}', [LibraryKioskController::class, 'employeeProfile'])->name('library.employee.qr.profile');
Route::post('/students/profile/request', [StudentController::class, 'submitEditRequest'])->name('library.students.profile.request');
Route::post('/employees/profile/request', [EmployeeController::class, 'submitEditRequest'])->name('library.employees.profile.request');
Route::get('/kiosk/scan', [LibraryKioskController::class, 'scan'])->name('library.kiosk.scan');
Route::post('/kiosk/lookup', [LibraryKioskController::class, 'lookup'])->name('library.kiosk.lookup');
Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('library.checkout.process');
Route::post('/checkout/bulk', [CheckoutController::class, 'bulk'])->name('library.checkout.bulk');
Route::get('/opac', [BookController::class, 'landingPage'])->name('library.landing');
Route::get('/opac/api/book/{book}', [BookController::class, 'opacBookDetails'])->name('library.opac.book.details');
Route::post('/opac/reserve', [BookReservationController::class, 'store'])->name('library.opac.reserve');
Route::get('/rooms/book', [RoomReservationController::class, 'create'])->name('library.rooms.book');
Route::post('/rooms/book', [RoomReservationController::class, 'store'])->name('library.room-reservations.store');
Route::get('/rooms/schedule', [RoomReservationController::class, 'schedule'])->name('library.rooms.schedule');
Route::get('/rooms/{id}/show', [RoomReservationController::class, 'show'])->name('library.rooms.show');

Route::middleware(['auth', 'library.access'])
    ->name('library.')
    ->group(function (): void {
        Route::get('/admin/activities', [AdminActivityController::class, 'index'])->name('admin.activities.index');
        Route::get('/admin/activities/recent', [AdminActivityController::class, 'recent'])->name('admin.activities.recent');
        Route::post('/admin/activities/mark-seen', [AdminActivityController::class, 'markSeen'])->name('admin.activities.mark_seen');
        Route::get('/library/navigation-status', LibraryNavigationStatusController::class)->name('navigation.status');

        Route::get('/book/catalog/courses-for-programs', [BookController::class, 'coursesForPrograms'])->name('books.coursesForPrograms');
        Route::resource('book', BookController::class)->except('index');
        Route::get('/books', [BookController::class, 'index'])->name('books.index');
        Route::get('/staff/books/copies', [BookController::class, 'viewCopiesStaff'])->name('books.copies.staff');
        Route::get('/staff/books/archived', [BookController::class, 'archivedIndex'])->name('books.archived');
        Route::get('/staff/books/trash', [BookController::class, 'trashIndex'])->name('books.trash');
        Route::post('/books/{book}/archive', [BookController::class, 'archive'])->name('books.archive');
        Route::post('/books/{book}/unarchive', [BookController::class, 'unarchive'])->name('books.unarchive');
        Route::post('/books/{id}/restore', [BookController::class, 'restoreTrashed'])->name('books.restore');
        Route::delete('/books/{id}/force-delete', [BookController::class, 'forceDeleteTrashed'])->name('books.forceDelete');
        Route::post('/import-books', [BookImportController::class, 'import'])->name('books.import');

        Route::resource('ebooks', EbookController::class);
        Route::get('/ebooks/get-courses/{programId}', [EbookController::class, 'getCourses'])->name('ebooks.courses');
        Route::get('/export-books', [ExportController::class, 'exportBooks'])->name('export.books');
        Route::get('/export-transactions', [ExportController::class, 'exportTransactions'])->name('transactions.export');
        Route::get('/download-book-report', [BookController::class, 'downloadBookReport'])->name('book.report.download');
        Route::get('/reports/library-holdings', [LibraryHoldingsReportController::class, 'create'])->name('reports.library_holdings.create');
        Route::post('/reports/library-holdings', [LibraryHoldingsReportController::class, 'download'])->name('reports.library_holdings.download');

        Route::get('/rfid-scanner', [RFIDScanController::class, 'index'])->name('rfid.scanner');
        Route::post('/rfid-scan', [RFIDScanController::class, 'scan'])->name('rfid.scan');
        Route::get('/patron-suggestions', [BookLogController::class, 'patronSuggestions'])->name('patron.suggestions');
        Route::get('/book-suggestions', [BookLogController::class, 'bookSuggestions'])->name('book.suggestions');
        Route::get('/book-title-log-suggestions', [BookLogController::class, 'bookTitleLogSuggestions'])->name('book.title.log.suggestions');

        Route::get('/catalog/copy/openlibrary', [OpenLibraryCopyCatalogController::class, 'searchForm'])->name('catalog.copy.openlibrary.form');
        Route::match(['get', 'post'], '/catalog/copy/openlibrary/search', [OpenLibraryCopyCatalogController::class, 'search'])->name('catalog.copy.openlibrary.search');
        Route::post('/catalog/copy/openlibrary/store', [OpenLibraryCopyCatalogController::class, 'store'])->name('catalog.copy.openlibrary.store');

        Route::get('/feedbacks', [FeedbackController::class, 'index'])->name('feedback.index');
        Route::get('/feedbacks/export/csv', [FeedbackController::class, 'exportCsv'])->name('feedback.export.csv');
        Route::get('/holidays/list', [HolidayController::class, 'list'])->name('holidays.list');
        Route::post('/holidays/toggle', [HolidayController::class, 'toggle'])->name('holidays.toggle');
        Route::get('/holidays/all', [HolidayController::class, 'all'])->name('holidays.all');
        Route::post('/sms/send', [SMSController::class, 'send'])->name('sms.send');
    });

Route::middleware(['auth', 'library.admin'])
    ->name('library.')
    ->group(function (): void {
        Route::get('/logs', [BookLogController::class, 'index'])->name('logs.index');
        Route::post('/logs', [BookLogController::class, 'store'])->name('logs.store');
        Route::post('/logs/{book}/renew', [BookLogController::class, 'renew'])->name('logs.renew');

        Route::prefix('prospectus')->name('prospectus.')->group(function (): void {
            Route::get('/', [ProspectusController::class, 'index'])->name('index');
            Route::post('/store-program', [ProspectusController::class, 'storeProgram'])->name('storeProgram');
            Route::get('/{program}/years', [ProspectusController::class, 'getProgramYears'])->name('getProgramYears');
        });
        Route::post('/prospectus/{program}/course', [ProspectusController::class, 'storeCourse'])->name('prospectus.storeCourse');
        Route::put('/prospectus/course/{course}', [ProspectusController::class, 'updateCourse'])->name('prospectus.updateCourse');
        Route::delete('/prospectus/course/{course}', [ProspectusController::class, 'destroyCourse'])->name('prospectus.destroyCourse');
        Route::put('/prospectus/program/{program}', [ProspectusController::class, 'updateProgram'])->name('prospectus.updateProgram');
        Route::delete('/prospectus/program/{program}', [ProspectusController::class, 'destroyProgram'])->name('prospectus.destroyProgram');

        Route::get('/students/report', [StudentController::class, 'index'])->name('students.report');
        Route::post('/students/import', [StudentController::class, 'import'])->name('students.import');
        Route::get('/students/export', [StudentController::class, 'export'])->name('students.export');
        Route::resource('students', StudentController::class);
        Route::get('/idcard/download/{id}', [IdCardController::class, 'download'])->name('idcard.download');
        Route::get('/student/pending-requests', [StudentController::class, 'pendingRequests'])->name('students.pending.requests');
        Route::post('/admin/requests/{id}/approve', [StudentController::class, 'approveRequest'])->name('admin.requests.approve');
        Route::post('/admin/requests/{id}/reject', [StudentController::class, 'rejectRequest'])->name('admin.requests.reject');
        Route::post('/admin/employee-requests/{id}/approve', [EmployeeController::class, 'approveEditRequest'])->name('admin.employee.requests.approve');
        Route::post('/admin/employee-requests/{id}/reject', [EmployeeController::class, 'rejectEditRequest'])->name('admin.employee.requests.reject');

        Route::get('/idcard/{id}', [IdCardController::class, 'generate'])->name('idcard.generate');
        Route::get('/idcard/front/{id}', [IdCardController::class, 'front'])->name('idcard.front');
        Route::get('/idcard/back/{id}', [IdCardController::class, 'back'])->name('idcard.back');

        Route::post('/admin/pending/{id}/approve', [StudentController::class, 'approve'])->name('students.approve');
        Route::post('/admin/pending/{id}/reject', [StudentController::class, 'reject'])->name('students.reject');
        Route::get('/pending', [PendingStudentController::class, 'index'])->name('pending.index');
        Route::get('/pending/employees', [PendingEmployeeController::class, 'index'])->name('pending.employees');
        Route::post('/pending/employees/approve/{id}', [PendingEmployeeController::class, 'approve'])->name('employees.approve');
        Route::post('/pending/employees/reject/{id}', [PendingEmployeeController::class, 'reject'])->name('employees.reject');

        Route::prefix('employees')->group(function (): void {
            Route::get('/', [EmployeeController::class, 'index'])->name('employees.index');
            Route::get('/create', [EmployeeController::class, 'create'])->name('employees.create');
            Route::post('/', [EmployeeController::class, 'store'])->name('employees.store');
            Route::get('/edit/{id}', [EmployeeController::class, 'edit'])->name('employees.edit');
            Route::put('/update/{id}', [EmployeeController::class, 'update'])->name('employees.update');
            Route::delete('/delete/{id}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
        });
        Route::prefix('employees/idcard')->group(function (): void {
            Route::get('/front/{id}', [EmployeeIdCardController::class, 'front'])->name('employees.id.front');
            Route::get('/back/{id}', [EmployeeIdCardController::class, 'back'])->name('employees.id.back');
            Route::get('/download/{id}', [EmployeeIdCardController::class, 'download'])->name('employees.id.download');
        });

        Route::get('/rooms/pending', [RoomReservationController::class, 'pending'])->name('rooms.pending');
        Route::post('/rooms/{id}/approve', [RoomReservationController::class, 'approve'])->name('rooms.approve');
        Route::post('/rooms/reject/{id}', [RoomReservationController::class, 'reject'])->name('rooms.reject');
        Route::delete('/resrooms/{id}', [RoomReservationController::class, 'destroy'])->name('resrooms.destroy');
        Route::get('/rooms/check-availability', [RoomReservationController::class, 'checkAvailability'])->name('rooms.check');
        Route::get('/rooms/logs', [RoomReservationController::class, 'logs'])->name('rooms.logs');
        Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');
        Route::get('/rooms/create', [RoomController::class, 'create'])->name('rooms.create');
        Route::post('/rooms', [RoomController::class, 'store'])->name('rooms.store');
        Route::get('/rooms/{id}/edit', [RoomController::class, 'edit'])->name('rooms.edit');
        Route::put('/rooms/{id}', [RoomController::class, 'update'])->name('rooms.update');
        Route::delete('/rooms/{id}', [RoomController::class, 'destroy'])->name('rooms.destroy');

        Route::get('/admin/circulation-policy', [CirculationPolicyController::class, 'edit'])->name('circulation.policy.edit');
        Route::post('/admin/circulation-policy', [CirculationPolicyController::class, 'update'])->name('circulation.policy.update');
        Route::get('/admin/fines/outstanding', [FineClearanceController::class, 'index'])->name('fines.outstanding');
        Route::post('/admin/fines/logs/{bookLog}/clear', [FineClearanceController::class, 'clear'])->name('fines.logs.clear');

        Route::prefix('library/attendance')->name('attendance.')->group(function (): void {
            Route::get('/logs', [LibraryAttendanceController::class, 'index'])->name('logs');
            Route::get('/logs/export/pdf', [LibraryAttendanceController::class, 'exportPdf'])->name('logs.export.pdf');
            Route::get('/logs/export/excel', [LibraryAttendanceController::class, 'exportExcel'])->name('logs.export.excel');
            Route::get('/logs/reports', [LibraryAttendanceController::class, 'reportsHub'])->name('logs.reports.hub');
            Route::get('/logs/reports/dashboard', [LibraryAttendanceController::class, 'reportsDashboard'])->name('logs.reports.dashboard');
            Route::get('/logs/reports/export', [LibraryAttendanceController::class, 'reportsExportCsv'])->name('logs.reports.export');
            Route::get('/scanner', [LibraryAttendanceController::class, 'showScanner'])->name('scanner');
            Route::post('/scanner', [LibraryAttendanceController::class, 'scan'])->name('scanner.process');
            Route::post('/scanner/section', [LibraryAttendanceController::class, 'processSection'])->name('scanner.section');
            Route::post('/feedback', [LibraryAttendanceFeedbackController::class, 'store'])->name('feedback.store');
            Route::get('/logout-feedback', [LibraryAttendanceFeedbackController::class, 'settings'])->name('feedback.settings');
            Route::post('/logout-feedback', [LibraryAttendanceFeedbackController::class, 'updateSettings'])->name('feedback.settings.update');
            Route::get('/feedback-responses', [LibraryAttendanceFeedbackController::class, 'index'])->name('feedbacks');
            Route::get('/video', [LibraryAttendanceVideoController::class, 'index'])->name('video');
            Route::post('/video/upload', [LibraryAttendanceVideoController::class, 'upload'])->name('uploadVideo');
        });

        Route::get('/sms-blast', [SMSController::class, 'index'])->name('sms.page');
        Route::get('/sms/scan-message', [SMSController::class, 'scanMessage'])->name('sms.scan-message');
        Route::post('/sms/scan-message', [SMSController::class, 'updateScanMessage'])->name('sms.scan-message.update');
        Route::post('/sms/send-one-student', [SMSController::class, 'sendOneStudent'])->name('sms.send-one-student');
        Route::post('/sms/send-overdue', [SMSController::class, 'sendOverdue'])->name('sms.send-overdue');
        Route::get('/sms/count', [SMSController::class, 'count'])->name('sms.count');

        Route::prefix('admin/catalog-frameworks')->name('admin.catalog_frameworks.')->group(function (): void {
            Route::get('/', [CatalogFrameworkAdminController::class, 'index'])->name('index');
            Route::get('/{catalog_framework}/edit', [CatalogFrameworkAdminController::class, 'edit'])->name('edit');
            Route::put('/{catalog_framework}/fields', [CatalogFrameworkAdminController::class, 'updateFields'])->name('fields.update');
            Route::post('/{catalog_framework}/fields', [CatalogFrameworkAdminController::class, 'attachField'])->name('fields.attach');
            Route::post('/{catalog_framework}/marc-fields', [CatalogFrameworkAdminController::class, 'storeMarcField'])->name('marc_fields.store');
            Route::delete('/{catalog_framework}/fields/{field}', [CatalogFrameworkAdminController::class, 'detachField'])->name('fields.detach');
        });

        Route::get('/admin/catalog-select-options', [CatalogMarcSelectOptionsController::class, 'index'])->name('admin.catalog_select_options.index');
        Route::post('/admin/catalog-select-options', [CatalogMarcSelectOptionsController::class, 'store'])->name('admin.catalog_select_options.store');
        Route::delete('/admin/catalog-select-options', [CatalogMarcSelectOptionsController::class, 'destroy'])->name('admin.catalog_select_options.destroy');

        Route::get('/files', [FileController::class, 'index'])->name('files.index');
        Route::post('/files/upload', [FileController::class, 'upload'])->name('files.upload');
        Route::get('/files/view/{id}', [FileController::class, 'view'])->name('files.view');
        Route::get('/files/download/{id}', [FileController::class, 'download'])->name('files.download');
        Route::delete('/files/delete/{id}', [FileController::class, 'delete'])->name('files.delete');

    });

Route::middleware(['auth', 'library.access'])->group(function (): void {
    Route::get('/book', fn () => redirect('/books'));
    Route::get('/program/{programId?}/courses', fn (?string $programId = null) => redirect()->route(
        'library.ebooks.courses',
        ['programId' => $programId ?: 'all'],
    ));
});

Route::middleware(['auth', 'library.admin'])->group(function (): void {
    Route::get('/admin/pending', fn () => redirect()->route('library.pending.index'));
    Route::get('/admin/fines', fn () => redirect('/admin/circulation-policy'));
    Route::get('/view-users', fn () => redirect('/staff-users'));
});
