<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\DashboardController;
use App\Http\Controllers\Auth\ModuleSelectionController;
use App\Http\Controllers\Library\AccountController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect()->route('login'));

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('auth')
    ->name('dashboard');

Route::middleware('auth')->group(function (): void {
    Route::get('/select-module', [ModuleSelectionController::class, 'create'])->name('module.select');
    Route::post('/select-module', [ModuleSelectionController::class, 'store'])->name('module.select.store');
    Route::get('/account', [AccountController::class, 'edit'])->name('account.edit');
    Route::put('/account/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::put('/account/password', [AccountController::class, 'updatePassword'])->name('account.password.update');
});

Route::get('/register', [RegistrationController::class, 'choice'])->name('register.choice');
Route::get('/register/success', fn () => Inertia::render('Register/Success'))->name('register.success');

require __DIR__.'/attendance.php';
require __DIR__.'/library.php';
require __DIR__.'/super-admin.php';
