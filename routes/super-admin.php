<?php

use App\Http\Controllers\Auth\DashboardController;
use App\Http\Controllers\Auth\StaffUserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard/super-admin', [DashboardController::class, 'superAdmin'])
        ->middleware('super-admin')
        ->name('super-admin.dashboard');

    Route::middleware('role:library_admin|attendance_admin|super_admin')
        ->prefix('staff-users')
        ->name('staff-users.')
        ->group(function (): void {
            Route::get('/', [StaffUserController::class, 'index'])->name('index');
            Route::get('/create', [StaffUserController::class, 'create'])->name('create');
            Route::post('/', [StaffUserController::class, 'store'])->name('store');
            Route::get('/{staffUser}/edit', [StaffUserController::class, 'edit'])->name('edit');
            Route::put('/{staffUser}', [StaffUserController::class, 'update'])->name('update');
            Route::patch('/{staffUser}/status', [StaffUserController::class, 'updateStatus'])->name('status.update');
            Route::delete('/{staffUser}', [StaffUserController::class, 'destroy'])->name('destroy');
        });
});
