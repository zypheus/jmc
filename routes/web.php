<?php

use App\Http\Controllers\Attendance\AttendanceController;
use App\Http\Controllers\Attendance\AttendanceLogController;
use App\Http\Controllers\Attendance\EmployeeController;
use App\Http\Controllers\Attendance\FeedController;
use App\Http\Controllers\Attendance\PendingEmployeeController;
use App\Http\Controllers\Attendance\PendingStudentController;
use App\Http\Controllers\Attendance\SettingsController;
use App\Http\Controllers\Attendance\SmsController;
use App\Http\Controllers\Attendance\StudentController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\DashboardController;
use App\Http\Controllers\Auth\StaffUserController;
use App\Http\Controllers\Library\AccountController;
use App\Http\Controllers\Library\AdminActivityController;
use App\Http\Controllers\Library\BookController;
use App\Http\Controllers\Library\BookImportController;
use App\Http\Controllers\Library\BookLogController;
use App\Http\Controllers\Library\BookReservationController;
use App\Http\Controllers\Library\CatalogMarcSelectOptionsController;
use App\Http\Controllers\Library\CatalogFrameworkAdminController;
use App\Http\Controllers\Library\CheckoutController;
use App\Http\Controllers\Library\CirculationPolicyController;
use App\Http\Controllers\Library\EbookController;
use App\Http\Controllers\Library\EmployeeController as LibraryEmployeeController;
use App\Http\Controllers\Library\EmployeeIdCardController;
use App\Http\Controllers\Library\ExportController;
use App\Http\Controllers\Library\FeedbackController;
use App\Http\Controllers\Library\FileController;
use App\Http\Controllers\Library\FineClearanceController;
use App\Http\Controllers\Library\HolidayController;
use App\Http\Controllers\Library\IdCardController;
use App\Http\Controllers\Library\LibraryHoldingsReportController;
use App\Http\Controllers\Library\OpenLibraryCopyCatalogController;
use App\Http\Controllers\Library\PendingEmployeeController as LibraryPendingEmployeeController;
use App\Http\Controllers\Library\PendingStudentController as LibraryPendingStudentController;
use App\Http\Controllers\Library\ProspectusController;
use App\Http\Controllers\Library\RFIDScanController;
use App\Http\Controllers\Library\RoomController;
use App\Http\Controllers\Library\RoomReservationController;
use App\Http\Controllers\Library\SMSController as LibrarySMSController;
use App\Http\Controllers\Library\StudentController as LibraryStudentController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/dashboard/library-admin', [DashboardController::class, 'libraryAdmin'])
        ->middleware('role:library_admin')
        ->name('dashboard.library-admin');

    Route::get('/dashboard/library-staff', [DashboardController::class, 'libraryStaff'])
        ->middleware('role:library_staff')
        ->name('dashboard.library-staff');

    Route::get('/dashboard/attendance-admin', [DashboardController::class, 'attendanceAdmin'])
        ->middleware('role:attendance_admin')
        ->name('dashboard.attendance-admin');

    Route::get('/dashboard/attendance-staff', [DashboardController::class, 'attendanceStaff'])
        ->middleware('role:attendance_staff')
        ->name('dashboard.attendance-staff');

    Route::get('/dashboard/super-admin', [DashboardController::class, 'superAdmin'])
        ->middleware('role:super_admin')
        ->name('dashboard.super-admin');

    Route::middleware('role:library_admin|attendance_admin|super_admin')
        ->prefix('staff-users')
        ->name('staff-users.')
        ->group(function () {
            Route::get('/', [StaffUserController::class, 'index'])->name('index');
            Route::get('/create', [StaffUserController::class, 'create'])->name('create');
            Route::post('/', [StaffUserController::class, 'store'])->name('store');
            Route::get('/{staffUser}/edit', [StaffUserController::class, 'edit'])->name('edit');
            Route::put('/{staffUser}', [StaffUserController::class, 'update'])->name('update');
            Route::delete('/{staffUser}', [StaffUserController::class, 'destroy'])->name('destroy');
        });
});

// Public registration choice
Route::get('/register', [RegistrationController::class, 'choice'])->name('register.choice');
Route::get('/register/success', fn () => Inertia\Inertia::render('Register/Success'))->name('register.success');

// Public attendance kiosk
Route::get('/attendance', [AttendanceController::class, 'showScanner'])->name('attendance.scan');
Route::post('/attendance', [AttendanceController::class, 'scan'])->name('attendance.process');
Route::post('/attendance/section', [AttendanceController::class, 'processSection'])->name('attendance.section');
Route::post('/attendance-feedback', [FeedController::class, 'store'])->name('attendance.feedback.store');

// Public attendance patron registration
Route::prefix('register/attendance')->name('attendance.register.')->group(function () {
    Route::get('/', [PendingStudentController::class, 'create'])->name('student.form');
    Route::get('/employee', [PendingEmployeeController::class, 'create'])->name('employee.form');
    Route::post('/', [PendingStudentController::class, 'store'])->name('student.store');
    Route::post('/employee', [PendingEmployeeController::class, 'store'])->name('employee.store');
});

// Attendance staff + admin
Route::middleware(['auth', 'role:attendance_admin|attendance_staff'])->prefix('attendance')->name('attendance.')->group(function () {
    Route::get('/pending', [PendingStudentController::class, 'index'])->name('pending.index');
    Route::post('/pending/students/{id}/approve', [StudentController::class, 'approve'])->name('pending.students.approve');
    Route::post('/pending/students/{id}/reject', [StudentController::class, 'reject'])->name('pending.students.reject');
    Route::post('/pending/employees/{id}/approve', [PendingEmployeeController::class, 'approve'])->name('pending.employees.approve');
    Route::post('/pending/employees/{id}/reject', [PendingEmployeeController::class, 'reject'])->name('pending.employees.reject');

    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');

    Route::get('/change-video', [SettingsController::class, 'showChangeVideo'])->name('changeVideo');
    Route::post('/upload-video', [SettingsController::class, 'uploadVideo'])->name('uploadVideo');
    Route::get('/logout-feedback', [SettingsController::class, 'feedbackSettings'])->name('feedback.settings');
    Route::post('/logout-feedback', [SettingsController::class, 'updateFeedbackSettings'])->name('feedback.settings.update');
    Route::get('/section-picker', [SettingsController::class, 'sectionSettings'])->name('section.settings');
    Route::post('/section-picker', [SettingsController::class, 'updateSectionSettings'])->name('section.settings.update');

    Route::get('/feedbacks', [FeedController::class, 'index'])->name('feedback.index');

    Route::get('/sms-blast', [SmsController::class, 'index'])->name('sms.page');
    Route::post('/sms/send', [SmsController::class, 'send'])->name('sms.send');
    Route::get('/sms/scan-message', [SmsController::class, 'scanMessage'])->name('sms.scanMessage');
    Route::post('/sms/scan-message', [SmsController::class, 'updateScanMessage'])->name('sms.scanMessage.update');
    Route::get('/sms/count', [SmsController::class, 'count'])->name('sms.count');

    Route::get('/logs', [AttendanceLogController::class, 'index'])->name('logs.index');
    Route::get('/logs/reports', [AttendanceLogController::class, 'reportsHub'])->name('logs.reports.hub');
    Route::get('/logs/reports/dashboard', [AttendanceLogController::class, 'reportsDashboard'])->name('logs.reports.dashboard');
    Route::get('/logs/reports/export', [AttendanceLogController::class, 'reportsExportCsv'])->name('logs.reports.export');
    Route::get('/logs/export/excel', [AttendanceLogController::class, 'exportExcel'])->name('logs.export.excel');
    Route::get('/logs/export/pdf', [AttendanceLogController::class, 'exportPdf'])->name('logs.export.pdf');
});

// Attendance admin only
Route::middleware(['auth', 'role:attendance_admin'])->prefix('attendance')->name('attendance.')->group(function () {
    Route::get('/students/create', [StudentController::class, 'create'])->name('students.create');
    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    Route::get('/students/{id}/edit', [StudentController::class, 'edit'])->name('students.edit');
    Route::put('/students/{id}', [StudentController::class, 'update'])->name('students.update');
    Route::delete('/students/{id}', [StudentController::class, 'destroy'])->name('students.destroy');

    Route::get('/employees/create', [EmployeeController::class, 'create'])->name('employees.create');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::get('/employees/{id}/edit', [EmployeeController::class, 'edit'])->name('employees.edit');
    Route::put('/employees/{id}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
});

// =============================================================================
// Library — public
// =============================================================================

Route::prefix('register/library')->name('library.register.')->group(function () {
    Route::get('/', [LibraryPendingStudentController::class, 'create'])->name('student.form');
    Route::get('/employee', [LibraryPendingEmployeeController::class, 'create'])->name('employee.form');
    Route::post('/', [LibraryPendingStudentController::class, 'store'])->name('student.store');
    Route::post('/employee', [LibraryPendingEmployeeController::class, 'store'])->name('employee.store');
});

Route::get('/filter/years', [BookController::class, 'getYears']);
Route::get('/filter/courses', [BookController::class, 'getCourses']);
Route::get('/books/copies', [BookController::class, 'viewCopies'])->name('library.books.copies');
Route::get('/feedback', [FeedbackController::class, 'create'])->name('library.feedback.create');
Route::post('/feedback', [FeedbackController::class, 'store'])->name('library.feedback.store');
Route::get('/student/qr/{qrcode}', [LibraryStudentController::class, 'profile'])->name('library.student.qr.profile');
Route::post('/students/profile/request', [LibraryStudentController::class, 'submitEditRequest'])->name('library.students.profile.request');
Route::get('/kiosk/scan', fn () => view('kiosk.scan'))->name('library.kiosk.scan');
Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('library.checkout.process');
Route::post('/checkout/bulk', [CheckoutController::class, 'bulk'])->name('library.checkout.bulk');
Route::get('/opac', [BookController::class, 'landingPage'])->name('library.landing');
Route::get('/opac/api/book/{book}', [BookController::class, 'opacBookDetails'])->name('library.opac.book.details');
Route::post('/opac/reserve', [BookReservationController::class, 'store'])->name('library.opac.reserve');
Route::get('/rooms/book', [RoomReservationController::class, 'create'])->name('library.rooms.book');
Route::post('/rooms/book', [RoomReservationController::class, 'store'])->name('library.room-reservations.store');
Route::get('/rooms/schedule', [RoomReservationController::class, 'schedule'])->name('library.rooms.schedule');
Route::get('/rooms/{id}/show', [RoomReservationController::class, 'show'])->name('library.rooms.show');

// Library staff + admin
Route::middleware(['auth', 'role:library_admin|library_staff'])->name('library.')->group(function () {
    Route::get('/account', [AccountController::class, 'edit'])->name('account.edit');
    Route::put('/account/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::put('/account/password', [AccountController::class, 'updatePassword'])->name('account.password.update');

    Route::get('/admin/activities', [AdminActivityController::class, 'index'])->name('admin.activities.index');
    Route::get('/admin/activities/recent', [AdminActivityController::class, 'recent'])->name('admin.activities.recent');
    Route::post('/admin/activities/mark-seen', [AdminActivityController::class, 'markSeen'])->name('admin.activities.mark_seen');

    Route::resource('book', BookController::class);
    Route::get('/book/catalog/courses-for-programs', [BookController::class, 'coursesForPrograms'])->name('books.coursesForPrograms');
    Route::get('/books', [BookController::class, 'index'])->name('books.index');
    Route::get('/staff/books/copies', [BookController::class, 'viewCopiesStaff'])->name('books.copies.staff');
    Route::get('/staff/books/archived', [BookController::class, 'archivedIndex'])->name('books.archived');
    Route::get('/staff/books/trash', [BookController::class, 'trashIndex'])->name('books.trash');
    Route::post('/books/{book}/archive', [BookController::class, 'archive'])->name('books.archive');
    Route::post('/books/{book}/unarchive', [BookController::class, 'unarchive'])->name('books.unarchive');
    Route::post('/books/{id}/restore', [BookController::class, 'restoreTrashed'])->name('books.restore');
    Route::delete('/books/{id}/force-delete', [BookController::class, 'forceDeleteTrashed'])->name('books.forceDelete');
    Route::delete('/books/{book}', [BookController::class, 'destroy'])->name('books.destroy');
    Route::post('/import-books', [BookImportController::class, 'import'])->name('books.import');

    Route::resource('ebooks', EbookController::class);
    Route::get('/program/{program?}/courses', [EbookController::class, 'getCourses'])->name('program.courses');
    Route::get('/ebooks/get-courses/{programId}', [EbookController::class, 'getCourses']);
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
    Route::post('/sms/send', [LibrarySMSController::class, 'send'])->name('sms.send');
});

// Library admin only
Route::middleware(['auth', 'role:library_admin'])->name('library.')->group(function () {
    Route::get('/logs', [BookLogController::class, 'index'])->name('logs.index');
    Route::post('/logs', [BookLogController::class, 'store'])->name('logs.store');
    Route::post('/logs/{book}/renew', [BookLogController::class, 'renew'])->name('logs.renew');

    Route::prefix('prospectus')->name('prospectus.')->group(function () {
        Route::get('/', [ProspectusController::class, 'index'])->name('index');
        Route::post('/store-program', [ProspectusController::class, 'storeProgram'])->name('storeProgram');
        Route::get('/{program}/years', [ProspectusController::class, 'getProgramYears'])->name('getProgramYears');
    });
    Route::post('/prospectus/{program}/course', [ProspectusController::class, 'storeCourse'])->name('prospectus.storeCourse');
    Route::put('/prospectus/course/{course}', [ProspectusController::class, 'updateCourse'])->name('prospectus.updateCourse');
    Route::delete('/prospectus/course/{course}', [ProspectusController::class, 'destroyCourse'])->name('prospectus.destroyCourse');
    Route::put('/prospectus/program/{program}', [ProspectusController::class, 'updateProgram'])->name('prospectus.updateProgram');
    Route::delete('/prospectus/program/{program}', [ProspectusController::class, 'destroyProgram'])->name('prospectus.destroyProgram');

    Route::get('/students/report', [LibraryStudentController::class, 'index'])->name('students.report');
    Route::post('/students/import', [LibraryStudentController::class, 'import'])->name('students.import');
    Route::get('/students/export', [LibraryStudentController::class, 'export'])->name('students.export');
    Route::resource('students', LibraryStudentController::class);
    Route::get('/idcard/download/{id}', [IdCardController::class, 'download'])->name('idcard.download');
    Route::get('/student/pending-requests', [LibraryStudentController::class, 'pendingRequests'])->name('students.pending.requests');
    Route::post('/admin/requests/{id}/approve', [LibraryStudentController::class, 'approveRequest'])->name('admin.requests.approve');
    Route::post('/admin/requests/{id}/reject', [LibraryStudentController::class, 'rejectRequest'])->name('admin.requests.reject');

    Route::get('/idcard/{id}', [IdCardController::class, 'generate']);
    Route::get('/idcard/front/{id}', [IdCardController::class, 'front']);
    Route::get('/idcard/back/{id}', [IdCardController::class, 'back'])->name('idcard.back');

    Route::get('/admin/pending', [LibraryStudentController::class, 'pending'])->name('students.pending');
    Route::post('/admin/pending/{id}/approve', [LibraryStudentController::class, 'approve'])->name('students.approve');
    Route::post('/admin/pending/{id}/reject', [LibraryStudentController::class, 'reject'])->name('students.reject');
    Route::get('/pending', [LibraryPendingStudentController::class, 'index'])->name('pending.index');
    Route::get('/pending/employees', [LibraryPendingEmployeeController::class, 'index'])->name('pending.employees');
    Route::post('/pending/employees/approve/{id}', [LibraryPendingEmployeeController::class, 'approve'])->name('employees.approve');
    Route::post('/pending/employees/reject/{id}', [LibraryPendingEmployeeController::class, 'reject'])->name('employees.reject');

    Route::prefix('employees')->group(function () {
        Route::get('/', [LibraryEmployeeController::class, 'index'])->name('employees.index');
        Route::get('/create', [LibraryEmployeeController::class, 'create'])->name('employees.create');
        Route::post('/', [LibraryEmployeeController::class, 'store'])->name('employees.store');
        Route::get('/edit/{id}', [LibraryEmployeeController::class, 'edit'])->name('employees.edit');
        Route::put('/update/{id}', [LibraryEmployeeController::class, 'update'])->name('employees.update');
        Route::delete('/delete/{id}', [LibraryEmployeeController::class, 'destroy'])->name('employees.destroy');
    });
    Route::prefix('employees/idcard')->group(function () {
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
    Route::redirect('/admin/fines', '/admin/circulation-policy')->name('fines.edit');
    Route::get('/admin/fines/outstanding', [FineClearanceController::class, 'index'])->name('fines.outstanding');
    Route::post('/admin/fines/logs/{bookLog}/clear', [FineClearanceController::class, 'clear'])->name('fines.logs.clear');

    Route::get('/sms-blast', [LibrarySMSController::class, 'index'])->name('sms.page');
    Route::get('/sms/scan-message', [LibrarySMSController::class, 'scanMessage'])->name('sms.scan-message');
    Route::post('/sms/scan-message', [LibrarySMSController::class, 'updateScanMessage'])->name('sms.scan-message.update');
    Route::post('/sms/send-one-student', [LibrarySMSController::class, 'sendOneStudent'])->name('sms.send-one-student');
    Route::post('/sms/send-overdue', [LibrarySMSController::class, 'sendOverdue'])->name('sms.send-overdue');
    Route::get('/sms/count', [LibrarySMSController::class, 'count'])->name('sms.count');

    Route::prefix('admin/catalog-frameworks')->name('admin.catalog_frameworks.')->group(function () {
        Route::get('/', [CatalogFrameworkAdminController::class, 'index'])->name('index');
        Route::get('/{catalog_framework}/edit', [CatalogFrameworkAdminController::class, 'edit'])->name('edit');
        Route::put('/{catalog_framework}/fields', [CatalogFrameworkAdminController::class, 'updateFields'])->name('fields.update');
        Route::post('/{catalog_framework}/fields', [CatalogFrameworkAdminController::class, 'attachField'])->name('fields.attach');
        Route::post('/{catalog_framework}/marc-fields', [CatalogFrameworkAdminController::class, 'storeMarcField'])->name('marc_fields.store');
        Route::delete('/{catalog_framework}/fields/{field}', [CatalogFrameworkAdminController::class, 'detachField'])->name('fields.detach');
    });

    Route::get('/admin/catalog-select-options', [CatalogMarcSelectOptionsController::class, 'index'])
        ->name('admin.catalog_select_options.index');
    Route::post('/admin/catalog-select-options', [CatalogMarcSelectOptionsController::class, 'store'])
        ->name('admin.catalog_select_options.store');
    Route::delete('/admin/catalog-select-options', [CatalogMarcSelectOptionsController::class, 'destroy'])
        ->name('admin.catalog_select_options.destroy');

    Route::get('/files', [FileController::class, 'index'])->name('files.index');
    Route::post('/files/upload', [FileController::class, 'upload'])->name('files.upload');
    Route::get('/files/view/{id}', [FileController::class, 'view'])->name('files.view');
    Route::get('/files/download/{id}', [FileController::class, 'download'])->name('files.download');
    Route::delete('/files/delete/{id}', [FileController::class, 'delete'])->name('files.delete');

    Route::redirect('/view-users', '/staff-users')->name('users.index');
});
