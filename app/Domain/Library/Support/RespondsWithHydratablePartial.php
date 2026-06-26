<?php

namespace App\Domain\Library\Support;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

trait RespondsWithHydratablePartial
{
    /**
     * @param  array<string, mixed>  $data
     */
    protected function hydratableResponse(
        Request $request,
        string $fullView,
        string $partialView,
        array $data,
        ?callable $partialResolver = null,
    ): View {
        if ($request->ajax()) {
            $partial = $partialResolver ? $partialResolver($request) : $partialView;

            return view($partial, $data);
        }

        return view($fullView, $data);
    }
}
