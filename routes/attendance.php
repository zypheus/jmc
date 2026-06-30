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
use App\Http\Controllers\Auth\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard/attendance-admin', [DashboardController::class, 'attendanceAdmin'])
        ->middleware('attendance.admin')
        ->name('attendance.dashboard.admin');

    Route::get('/dashboard/attendance-staff', [DashboardController::class, 'attendanceStaff'])
        ->middleware('attendance.access')
        ->name('attendance.dashboard.staff');
});

Route::get('/attendance', [AttendanceController::class, 'showScanner'])->name('attendance.scan');
Route::post('/attendance', [AttendanceController::class, 'scan'])->name('attendance.process');
Route::post('/attendance/section', [AttendanceController::class, 'processSection'])->name('attendance.section');
Route::post('/attendance-feedback', [FeedController::class, 'store'])->name('attendance.feedback.store');

Route::prefix('register/attendance')->name('attendance.register.')->group(function (): void {
    Route::get('/', [PendingStudentController::class, 'create'])->name('student.form');
    Route::get('/employee', [PendingEmployeeController::class, 'create'])->name('employee.form');
    Route::post('/', [PendingStudentController::class, 'store'])->name('student.store');
    Route::post('/employee', [PendingEmployeeController::class, 'store'])->name('employee.store');
});

Route::middleware(['auth', 'attendance.access'])
    ->prefix('attendance')
    ->name('attendance.')
    ->group(function (): void {
        Route::get('/pending', [PendingStudentController::class, 'index'])->name('pending.index');
        Route::post('/pending/students/{id}/approve', [StudentController::class, 'approve'])->name('pending.students.approve');
        Route::post('/pending/students/{id}/reject', [StudentController::class, 'reject'])->name('pending.students.reject');
        Route::post('/pending/employees/{id}/approve', [PendingEmployeeController::class, 'approve'])->name('pending.employees.approve');
        Route::post('/pending/employees/{id}/reject', [PendingEmployeeController::class, 'reject'])->name('pending.employees.reject');

        Route::get('/students', [StudentController::class, 'index'])->name('students.index');
        Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');

        Route::get('/section-picker', [SettingsController::class, 'sectionSettings'])->name('section.settings');
        Route::post('/section-picker', [SettingsController::class, 'updateSectionSettings'])->name('section.settings.update');

        Route::get('/sms-blast', [SmsController::class, 'index'])->name('sms.page');
        Route::post('/sms/send', [SmsController::class, 'send'])->name('sms.send');
        Route::get('/sms/scan-message', [SmsController::class, 'scanMessage'])->name('sms.scanMessage');
        Route::post('/sms/scan-message', [SmsController::class, 'updateScanMessage'])->name('sms.scanMessage.update');
        Route::get('/sms/count', [SmsController::class, 'count'])->name('sms.count');
    });

Route::middleware(['auth', 'attendance.admin'])
    ->prefix('attendance')
    ->name('attendance.')
    ->group(function (): void {
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

        Route::get('/logs', [AttendanceLogController::class, 'index'])->name('logs.index');
        Route::get('/logs/reports', [AttendanceLogController::class, 'reportsHub'])->name('logs.reports.hub');
        Route::get('/logs/reports/dashboard', [AttendanceLogController::class, 'reportsDashboard'])->name('logs.reports.dashboard');
        Route::get('/logs/reports/export', [AttendanceLogController::class, 'reportsExportCsv'])->name('logs.reports.export');
        Route::get('/logs/export/excel', [AttendanceLogController::class, 'exportExcel'])->name('logs.export.excel');
        Route::get('/logs/export/pdf', [AttendanceLogController::class, 'exportPdf'])->name('logs.export.pdf');

        Route::get('/feedbacks', [FeedController::class, 'index'])->name('feedbacks');
        Route::get('/change-video', [SettingsController::class, 'changeVideo'])->name('changeVideo');
        Route::post('/upload-video', [SettingsController::class, 'uploadVideo'])->name('uploadVideo');
        Route::get('/logout-feedback', [SettingsController::class, 'feedbackSettings'])->name('feedback.settings');
        Route::post('/logout-feedback', [SettingsController::class, 'updateFeedbackSettings'])->name('feedback.settings.update');
    });

Route::middleware(['auth', 'attendance.admin'])->group(function (): void {
    Route::get('/attendance-logs', fn () => redirect('/attendance/logs'));
    Route::get('/attendance-logs/reports', fn () => redirect('/attendance/logs/reports'));
    Route::get('/attendance-logs/reports/dashboard', fn () => redirect('/attendance/logs/reports/dashboard'));
});
