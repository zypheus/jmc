<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /** @return array<string, mixed> */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => fn () => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'fname' => $request->user()->fname,
                    'lname' => $request->user()->lname,
                    'fullName' => $request->user()->full_name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->getRoleNames()->values()->all(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'branding' => [
                'blue' => '#1f4ea7',
                'green' => '#2e7d32',
                'gold' => '#ffd700',
            ],
        ];
    }
}
