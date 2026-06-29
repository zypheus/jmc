<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryProgram;
use App\Domain\Library\Models\LibraryProgramCourse;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProspectusController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $programs = LibraryProgram::with(['courses' => fn ($q) => $q->orderBy('year_level')->orderBy('course_code')])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->where('program_code', 'like', "%{$search}%")
                        ->orWhere('program_name', 'like', "%{$search}%")
                        ->orWhereHas('courses', function ($courseQuery) use ($search) {
                            $courseQuery->where('course_code', 'like', "%{$search}%")
                                ->orWhere('course_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('program_name')
            ->get();

        $stats = [
            'programs' => LibraryProgram::count(),
            'courses' => LibraryProgramCourse::count(),
        ];

        return Inertia::render('Library/Prospectus/Index', compact('programs', 'stats', 'search'));
    }

    public function storeProgram(Request $request)
    {
        $data = $request->validate([
            'program_code' => 'required|unique:library_programs,program_code',
            'program_name' => 'required',
            'total_years' => 'required|integer|min:1|max:6',
        ]);

        $program = LibraryProgram::create($data);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PROSPECTUS,
            'Program created',
            "{$program->program_code} â€” {$program->program_name}",
            route('library.prospectus.index'),
            'book',
            $program,
        );

        return redirect()->route('library.prospectus.index')->with('success', 'Program created successfully.');
    }

    public function getProgramYears(LibraryProgram $program)
    {
        $program->load('courses');

        $years = $program->courses
            ->groupBy('year_level')
            ->sortKeys()
            ->map(function ($courses, $level) {
                return [
                    'id' => (int) $level,
                    'year_level' => (int) $level,
                    'courses' => $courses->values(),
                ];
            })
            ->values();

        return response()->json(['years' => $years]);
    }

    public function storeCourse(Request $request, LibraryProgram $program)
    {
        $data = $request->validate([
            'year_level' => 'required|integer|min:1|max:6',
            'course_code' => 'required',
            'course_name' => 'required',
        ]);

        $course = LibraryProgramCourse::create([
            'program_id' => $program->id,
            'year_level' => $data['year_level'],
            'course_code' => $data['course_code'],
            'course_name' => $data['course_name'],
        ]);

        if ($request->ajax()) {
            AdminActivityLogger::staff(
                AdminActivity::TYPE_PROSPECTUS,
                'Course added',
                "{$course->course_code} â€” {$course->course_name}",
                route('library.prospectus.index'),
                'book',
                $course,
            );

            return view('prospectus.partials.course_item', compact('course'))->render();
        }

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PROSPECTUS,
            'Course added',
            "{$course->course_code} â€” {$course->course_name}",
            route('library.prospectus.index'),
            'book',
            $course,
        );

        return redirect()->route('library.prospectus.index')->with('success', 'Course added successfully.');
    }

    public function updateCourse(Request $request, LibraryProgramCourse $course)
    {
        $request->validate([
            'course_code' => 'required|string|max:50',
            'course_name' => 'required|string|max:255',
        ]);

        $course->update([
            'course_code' => $request->course_code,
            'course_name' => $request->course_name,
        ]);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PROSPECTUS,
            'Course updated',
            "{$course->course_code} â€” {$course->course_name}",
            route('library.prospectus.index'),
            'book',
            $course,
        );

        if ($request->ajax()) {
            return view('prospectus.partials.course_item', compact('course'))->render();
        }

        return redirect()->back()->with('success', 'Course updated successfully.');
    }

    public function destroyCourse(Request $request, LibraryProgramCourse $course)
    {
        $label = "{$course->course_code} â€” {$course->course_name}";
        $course->delete();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PROSPECTUS,
            'Course deleted',
            $label,
            route('library.prospectus.index'),
            'book',
        );

        if ($request->ajax()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('success', 'Course deleted successfully.');
    }

    public function updateProgram(Request $request, LibraryProgram $program)
    {
        $request->validate([
            'program_code' => 'required|string|max:50',
            'program_name' => 'required|string|max:255',
        ]);

        $program->update([
            'program_code' => $request->program_code,
            'program_name' => $request->program_name,
        ]);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PROSPECTUS,
            'Program updated',
            "{$program->program_code} â€” {$program->program_name}",
            route('library.prospectus.index'),
            'book',
            $program,
        );

        return response()->json([
            'id' => $program->id,
            'program_code' => $program->program_code,
            'program_name' => $program->program_name,
        ]);
    }

    public function destroyProgram(LibraryProgram $program)
    {
        $label = "{$program->program_code} â€” {$program->program_name}";
        $program->delete();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_PROSPECTUS,
            'Program deleted',
            $label,
            route('library.prospectus.index'),
            'book',
        );

        return response()->json([
            'success' => true,
            'id' => $program->id,
        ]);
    }
}
