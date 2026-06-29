<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryHoliday;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function all()
    {
        return response()->json(
            LibraryHoliday::orderBy('holiday_date')->get()
        );
    }

    public function list()
    {
        return response()->json(LibraryHoliday::all());
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'name' => 'nullable|string|max:255',
        ]);

        $date = $validated['date'];

        $holiday = LibraryHoliday::where('holiday_date', $date)->first();

        if ($holiday) {
            $holiday->delete();

            AdminActivityLogger::staff(
                AdminActivity::TYPE_SETTINGS,
                'Holiday removed',
                $date,
                route('library.books.index'),
                'library_staff',
            );

            return response()->json([
                'status' => 'removed',
            ]);
        }

        $holiday = LibraryHoliday::create([
            'holiday_date' => $date,
            'name' => $validated['name'] ?? null,
        ]);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_SETTINGS,
            'Holiday added',
            ($holiday->name ?: $date),
            route('library.books.index'),
            'library_staff',
            $holiday,
        );

        return response()->json([
            'status' => 'added',
            'name' => $holiday->name,
        ]);
    }
}
