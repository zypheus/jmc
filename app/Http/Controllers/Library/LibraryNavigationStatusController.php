<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Services\LibraryNavigationStatusService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LibraryNavigationStatusController extends Controller
{
    public function __invoke(
        Request $request,
        LibraryNavigationStatusService $statusService,
    ): JsonResponse {
        abort_unless($statusService->canView($request->user()), 403);

        return response()->json([
            'counts' => $statusService->counts(),
        ]);
    }
}
