<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\ModuleAccessService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly ModuleAccessService $moduleAccess) {}

    public function showLogin(): View
    {
        return view('landing.page', ['openLoginModal' => true]);
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

        $user = $request->user();

        if (! $user->is_active) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Your staff account is inactive.',
            ]);
        }

        $request->session()->regenerate();
        $request->session()->forget('active_module');

        try {
            $request->session()->put('active_module', $this->moduleAccess->defaultModule($user));
        } catch (\InvalidArgumentException) {
            // redirectForRole handles accounts without an assigned staff module.
        }

        return $this->redirectForRole($user);
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('status', 'You have been logged out.');
    }

    protected function redirectForRole(User $user): RedirectResponse
    {
        try {
            return redirect()->route($this->moduleAccess->defaultDashboardRoute($user));
        } catch (\InvalidArgumentException) {
            Auth::guard('web')->logout();

            return redirect()->route('login')->with('error', 'Your account has no assigned role.');
        }
    }
}
