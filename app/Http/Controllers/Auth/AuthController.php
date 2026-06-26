<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        return $this->redirectForRole($request->user());
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    protected function redirectForRole(User $user): RedirectResponse
    {
        if ($user->hasRole('super_admin')) {
            return redirect()->route('dashboard.super-admin');
        }

        if ($user->hasRole('library_admin')) {
            return redirect()->route('dashboard.library-admin');
        }

        if ($user->hasRole('library_staff')) {
            return redirect()->route('dashboard.library-staff');
        }

        if ($user->hasRole('attendance_admin')) {
            return redirect()->route('dashboard.attendance-admin');
        }

        if ($user->hasRole('attendance_staff')) {
            return redirect()->route('dashboard.attendance-staff');
        }

        Auth::logout();

        return redirect()->route('login')->with('error', 'Your account has no assigned role.');
    }
}
