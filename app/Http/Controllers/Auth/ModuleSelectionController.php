<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\ModuleAccessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class ModuleSelectionController extends Controller
{
    public function __construct(private readonly ModuleAccessService $moduleAccess) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'module' => ['required', 'string', Rule::in([
                ModuleAccessService::ATTENDANCE,
                ModuleAccessService::LIBRARY,
                ModuleAccessService::SUPER_ADMIN,
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
