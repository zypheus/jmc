<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\ModuleAccessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

final class ModuleSelectionController extends Controller
{
    public function __construct(private readonly ModuleAccessService $moduleAccess) {}

    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $this->moduleAccess->hasMultipleModules($user)) {
            return redirect()->route($this->moduleAccess->defaultDashboardRoute($user));
        }

        return Inertia::render('Auth/SelectModule', [
            'availableModules' => $this->moduleAccess->availableModules($user),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'module' => ['required', 'string', Rule::in([
                ModuleAccessService::ATTENDANCE,
                ModuleAccessService::LIBRARY,
            ])],
        ]);

        $module = $validated['module'];
        abort_unless($this->moduleAccess->canAccessModule($request->user(), $module), 403);

        $request->session()->put('active_module', $module);

        return redirect()->route(
            $this->moduleAccess->dashboardRouteForModule($request->user(), $module)
        );
    }
}
