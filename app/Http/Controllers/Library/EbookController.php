<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryEbook;
use App\Domain\Library\Models\LibraryProgram;
use App\Domain\Library\Models\LibraryProgramCourse;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Domain\Library\Support\PerPage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EbookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = LibraryEbook::with(['program', 'course']);

        // Apply filters based on dropdown selections
        if ($request->filled('title')) {
            $query->where('title', $request->title);
        }

        if ($request->filled('author')) {
            $query->where('author', $request->author);
        }

        if ($request->filled('year')) {
            $query->where('publication_year', $request->year);
        }

        if ($request->filled('publisher')) {
            $query->where('publisher', $request->publisher);
        }

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        // New: program & course filters
        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        $ebooks = $query->latest()->paginate(PerPage::resolve($request, 15))->withQueryString();

        return Inertia::render('Library/Ebooks/Index', [
            'library_ebooks' => $ebooks,
            'totalCount' => LibraryEbook::count(),
            'allTitles' => LibraryEbook::select('title')->distinct()->orderBy('title')->pluck('title'),
            'allAuthors' => LibraryEbook::select('author')->distinct()->orderBy('author')->pluck('author'),
            'allYears' => LibraryEbook::select('publication_year')->distinct()->orderBy('publication_year')->pluck('publication_year'),
            'allPublishers' => LibraryEbook::select('publisher')->distinct()->orderBy('publisher')->pluck('publisher'),
            'allSources' => LibraryEbook::select('source')->distinct()->orderBy('source')->pluck('source'),
            'allPrograms' => LibraryProgram::orderBy('program_name')->get(),
            'allCourses' => LibraryProgramCourse::orderBy('course_name')->get(),
            'filters' => [
                'title' => (string) $request->input('title', ''),
                'author' => (string) $request->input('author', ''),
                'year' => (string) $request->input('year', ''),
                'publisher' => (string) $request->input('publisher', ''),
                'source' => (string) $request->input('source', ''),
                'program_id' => (string) $request->input('program_id', ''),
                'course_id' => (string) $request->input('course_id', ''),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $programs = LibraryProgram::orderBy('program_name')->get();
        $courses = LibraryProgramCourse::orderBy('course_name')->get();

        return Inertia::render('Library/Ebooks/Create', [
            'programs' => $programs,
            'courses' => $courses,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publication_year' => 'nullable|string|max:50',
            'publisher' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:255',
            'link' => 'nullable|url|max:255',
            'program_id' => 'nullable|exists:library_programs,id',
            'course_id' => 'nullable|exists:program_courses,id',
        ]);

        // Handle "all" for program
        if ($request->program_id === 'all') {
            $validated['program_id'] = null;
        }

        $ebook = LibraryEbook::create($validated);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_EBOOK,
            'E-book added',
            "«{$ebook->title}»",
            route('library.ebooks.edit', $ebook->id),
            'book',
            $ebook,
        );

        return redirect()->route('library.ebooks.index')
            ->with('success', 'E-Book added successfully!');
    }

    public function update(Request $request, $id)
    {
        $ebook = LibraryEbook::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publication_year' => 'nullable|string|max:50',
            'publisher' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:255',
            'link' => 'nullable|url|max:255',
            'program_id' => 'nullable|exists:library_programs,id',
            'course_id' => 'nullable|exists:program_courses,id',
        ]);

        // Handle "all" for program
        if ($request->program_id === 'all') {
            $validated['program_id'] = null;
        }

        $ebook->update($validated);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_EBOOK,
            'E-book updated',
            "«{$ebook->title}»",
            route('library.ebooks.edit', $ebook->id),
            'book',
            $ebook,
        );

        return redirect()->route('library.ebooks.index')
            ->with('success', 'E-Book updated successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(LibraryEbook $ebook)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $ebook = LibraryEbook::findOrFail($id);

        $programs = LibraryProgram::orderBy('program_name')->get();
        $courses = LibraryProgramCourse::orderBy('course_name')->get();

        return Inertia::render('Library/Ebooks/Edit', [
            'ebook' => $ebook,
            'programs' => $programs,
            'courses' => $courses,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LibraryEbook $ebook)
    {
        $title = $ebook->title;
        $ebook->delete();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_EBOOK,
            'E-book deleted',
            "«{$title}»",
            route('library.ebooks.index'),
            'book',
        );

        return redirect()->route('library.ebooks.index')->with('success', 'E-Book deleted successfully!');
    }

    public function getCourses($programId)
    {
        if ($programId === 'all') {
            $courses = LibraryProgramCourse::all()->map(function ($course) {
                return [
                    'id' => $course->id,
                    'name' => $course->course_name,
                ];
            });
        } else {
            $courses = LibraryProgramCourse::where('program_id', $programId)->get()->map(function ($course) {
                return [
                    'id' => $course->id,
                    'name' => $course->course_name,
                ];
            });
        }

        return response()->json($courses);
    }
}
