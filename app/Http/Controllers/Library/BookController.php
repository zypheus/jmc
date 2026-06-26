<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryBookMarcField;
use App\Domain\Library\Models\LibraryBookReservation;
use App\Domain\Library\Models\LibraryEbook;
use App\Domain\Library\Models\LibraryProgram;
use App\Domain\Library\Models\LibraryProgramCourse;
use App\Domain\Library\Models\LibrarySetting;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Domain\Library\Services\BookMarcDisplay;
use App\Domain\Library\Support\PerPage;
use App\Domain\Library\Support\PublicStoragePublisher;
use App\Http\Controllers\BookLogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class BookController extends Controller
{
    public function __construct(protected BookMarcDisplay $marcDisplay) {}

    /**
     * Fallback default when no borrow-limit setting exists. Live limits are in {@see Setting}.
     * Enforced in {@see BookLogController} and {@see CheckoutController}.
     */
    public const MAX_CONCURRENT_BOOK_LOANS_PER_STUDENT = 3;

    /** @deprecated Use {@see LibrarySetting::maxRenewalsPerLoan()} */
    public const MAX_RENEWALS_PER_LOAN = LibrarySetting::DEFAULT_MAX_RENEWALS_PER_LOAN;

    /** @deprecated Use {@see LibrarySetting::reborrowCooldownDays()} */
    public const REBORROW_COOLDOWN_DAYS = LibrarySetting::DEFAULT_REBORROW_COOLDOWN_DAYS;

    protected function applyBookSearch($query, ?string $search)
    {
        $search = is_string($search) ? trim($search) : '';
        if ($search === '') {
            return $query;
        }

        // Multi-keyword search: all tokens must match somewhere.
        $tokens = preg_split('/\s+/', $search) ?: [];
        $tokens = array_values(array_filter(array_map('trim', $tokens)));

        foreach ($tokens as $token) {
            $like = "%{$token}%";
            $query->where(function ($q) use ($like, $token) {
                $q->where('title_statement', 'like', $like)
                    ->orWhere('main_author', 'like', $like)
                    ->orWhere('title_author', 'like', $like)
                    ->orWhere('control_no', 'like', $like)
                    ->orWhere('isbn', 'like', $like)
                    ->orWhere('publisher', 'like', $like)
                    ->orWhere('pub_place', 'like', $like)
                    ->orWhere('pub_year', 'like', $like)
                    ->orWhere('edition', 'like', $like)
                    ->orWhere('call_number', 'like', $like)
                    ->orWhere('accession_no', 'like', $like)
                    ->orWhere('barcode', 'like', $like)
                    ->orWhere('rfid', 'like', $like)
                    ->orWhere('availability', 'like', $like)
                    ->orWhere('content_type', 'like', $like)
                    ->orWhere('media_type', 'like', $like)
                    ->orWhere('carrier_type', 'like', $like)
                    ->orWhere('library_name', 'like', $like)
                    ->orWhere('section', 'like', $like)
                    ->orWhere('course', 'like', $like)
                    ->orWhere('curriculum', 'like', $like)
                    ->orWhere('year', 'like', $like)
                    ->orWhere('series_title', 'like', $like)
                    ->orWhere('subject_topic', 'like', $like)
                    ->orWhere('subject_form', 'like', $like)
                    ->orWhere('genre', 'like', $like)
                    ->orWhere('general_note', 'like', $like)
                    ->orWhere('bibliography_note', 'like', $like)
                    ->orWhere('source_vendor', 'like', $like)
                    ->orWhere('source_date', 'like', $like);

                // Allow searching by program name/code via pivot
                $q->orWhereHas('library_programs', function ($p) use ($token) {
                    $p->where('programs.program_name', 'like', "%{$token}%")
                        ->orWhere('programs.program_code', 'like', "%{$token}%");
                });
            });
        }

        return $query;
    }

    protected function booksFramework()
    {
        return $this->marcDisplay->booksFramework();
    }

    /** Strip empty selects so `exists:programs,id` does not run on "". */
    protected function normalizeProgramIdsOnRequest(Request $request): void
    {
        $raw = $request->input('program_ids', []);
        if (! is_array($raw)) {
            $raw = [];
        }
        $ids = array_values(array_unique(array_filter(array_map(static function ($v) {
            $i = (int) $v;

            return $i > 0 ? $i : null;
        }, $raw))));
        $request->merge(['program_ids' => $ids]);
    }

    protected function marcValuesForBook(LibraryBook $book, $frameworkFields = null): array
    {
        return $this->marcDisplay->marcValuesForBook($book, $frameworkFields);
    }

    protected function extractMarcPayload(Request $request): array
    {
        $marc = $request->input('marc', []);

        return is_array($marc) ? $marc : [];
    }

    protected function normalizeMarcValues(array $marc, string $tag, ?string $subfield): array
    {
        $subKey = $subfield ?? '_';
        $vals = $marc[$tag][$subKey] ?? [];
        if (! is_array($vals)) {
            $vals = [$vals];
        }
        $vals = array_values(array_filter(array_map(static function ($v) {
            $v = is_string($v) ? trim($v) : $v;

            return $v === '' ? null : $v;
        }, $vals)));

        return $vals;
    }

    protected function saveMarcFieldsForBook(LibraryBook $book, $framework, array $marc): void
    {
        if (! $framework) {
            return;
        }

        foreach ($framework->fields as $ff) {
            $mf = $ff->marcField;
            if (! $mf) {
                continue;
            }

            $values = $this->normalizeMarcValues($marc, $mf->tag, $mf->subfield);

            if ($ff->required && count($values) === 0) {
                $subKey = $mf->subfield ?? '_';
                throw ValidationException::withMessages([
                    "marc.{$mf->tag}.{$subKey}" => ["{$mf->tag}".($mf->subfield ? " ‡{$mf->subfield}" : '').' is required.'],
                ]);
            }

            LibraryBookMarcField::where('book_id', $book->id)
                ->where('tag', $mf->tag)
                ->where(function ($q) use ($mf) {
                    if ($mf->subfield === null) {
                        $q->whereNull('subfield');
                    } else {
                        $q->where('subfield', $mf->subfield);
                    }
                })
                ->delete();

            foreach ($values as $i => $val) {
                LibraryBookMarcField::create([
                    'book_id' => $book->id,
                    'tag' => $mf->tag,
                    'subfield' => $mf->subfield,
                    'occurrence' => $i,
                    'value' => $val,
                ]);
            }

            if ($ff->book_column) {
                $book->{$ff->book_column} = $values[0] ?? null;
            }
        }

        $book->save();
    }

    /**
     * @return array<string, array<string, array<int, string>>>
     */
    protected function stripCopyIdentifiersFromMarc(array $marc): array
    {
        foreach (config('catalog.copy_unique_marc', []) as $def) {
            $tag = $def['tag'];
            $subKey = ($def['subfield'] ?? null) ?? '_';
            unset($marc[$tag][$subKey]);
            if (isset($marc[$tag]) && $marc[$tag] === []) {
                unset($marc[$tag]);
            }
        }

        return $marc;
    }

    /**
     * @param  array<string, mixed>  $copy
     * @return array<string, array<string, array<int, string>>>
     */
    protected function applyCopyIdentifiersToMarc(array $marc, array $copy): array
    {
        foreach (config('catalog.copy_unique_marc', []) as $def) {
            $column = $def['book_column'];
            $val = trim((string) ($copy[$column] ?? ''));
            if ($val === '') {
                continue;
            }
            $tag = $def['tag'];
            $subKey = ($def['subfield'] ?? null) ?? '_';
            $marc[$tag][$subKey][0] = $val;
        }

        return $marc;
    }

    protected function validateCopyRows(Request $request): void
    {
        $copies = $request->input('copies', []);
        if (! is_array($copies) || count($copies) === 0) {
            throw ValidationException::withMessages([
                'copies' => ['Add at least one copy (accession and/or RFID).'],
            ]);
        }

        $accessions = [];
        $rfids = [];
        $errors = [];

        foreach ($copies as $i => $copy) {
            if (! is_array($copy)) {
                continue;
            }
            $acc = trim((string) ($copy['accession_no'] ?? ''));
            $rfid = trim((string) ($copy['rfid'] ?? ''));

            if ($acc === '' && $rfid === '') {
                $errors["copies.{$i}.accession_no"] = ['Each copy needs an accession number and/or RFID.'];

                continue;
            }

            if ($acc !== '') {
                if (in_array($acc, $accessions, true)) {
                    $errors["copies.{$i}.accession_no"] = ['Duplicate accession in this batch.'];
                } elseif (LibraryBook::withTrashed()->where('accession_no', $acc)->exists()) {
                    $errors["copies.{$i}.accession_no"] = ['Accession already exists in the catalog.'];
                } else {
                    $accessions[] = $acc;
                }
            }

            if ($rfid !== '') {
                if (in_array($rfid, $rfids, true)) {
                    $errors["copies.{$i}.rfid"] = ['Duplicate RFID in this batch.'];
                } elseif (LibraryBook::withTrashed()->where('rfid', $rfid)->exists()) {
                    $errors["copies.{$i}.rfid"] = ['RFID already exists in the catalog.'];
                } else {
                    $rfids[] = $rfid;
                }
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    /**
     * @param  array<string, array<string, array<int, string>>>  $marc
     */
    protected function createAdditionalCopiesFromBook(LibraryBook $sourceBook, Request $request, $framework, array $marc): int
    {
        $baseMarc = $this->stripCopyIdentifiersFromMarc($marc);
        $programIds = $sourceBook->load('library_programs')->programs->pluck('id')->all();

        $shared = [
            'availability' => 'Available',
            'year' => $sourceBook->year,
            'course' => $sourceBook->course,
            'curriculum' => $sourceBook->curriculum,
            'reserved' => $sourceBook->reserved,
            'cover_image' => $sourceBook->cover_image,
        ];

        $created = 0;
        foreach ($request->input('copies', []) as $copy) {
            if (! is_array($copy)) {
                continue;
            }
            $acc = trim((string) ($copy['accession_no'] ?? ''));
            $rfid = trim((string) ($copy['rfid'] ?? ''));
            if ($acc === '' && $rfid === '') {
                continue;
            }

            $book = LibraryBook::create($shared);
            $copyMarc = $this->applyCopyIdentifiersToMarc($baseMarc, $copy);
            $this->saveMarcFieldsForBook($book, $framework, $copyMarc);
            $this->assertCopyUniqueOnBook($book);

            if ($programIds !== []) {
                $book->programs()->attach($programIds);
            }

            $created++;
        }

        if ($created === 0) {
            throw ValidationException::withMessages([
                'copies' => ['Add at least one copy with an accession number and/or RFID.'],
            ]);
        }

        return $created;
    }

    protected function assertCopyUniqueOnBook(LibraryBook $book): void
    {
        if ($book->barcode && LibraryBook::withTrashed()->where('barcode', $book->barcode)->where('id', '!=', $book->id)->exists()) {
            throw ValidationException::withMessages(['marc.876.p' => ['Barcode must be unique.']]);
        }
        if ($book->rfid && LibraryBook::withTrashed()->where('rfid', $book->rfid)->where('id', '!=', $book->id)->exists()) {
            throw ValidationException::withMessages(['marc.999.r' => ['RFID must be unique.']]);
        }
        if ($book->accession_no && LibraryBook::withTrashed()->where('accession_no', $book->accession_no)->where('id', '!=', $book->id)->exists()) {
            throw ValidationException::withMessages(['copies' => ['Accession '.$book->accession_no.' already exists in the catalog.']]);
        }
    }

    public function index(Request $request)
    {
        $programs = LibraryProgram::orderBy('program_name')->get();

        $statusFilter = $request->input('status');
        $programId = $request->filled('program') ? (int) $request->input('program') : null;
        $yearFilter = $request->input('year_filter');
        $validYearFilters = ['exact', 'before', 'after', 'between'];

        $hasActiveQuery = $request->boolean('show_all')
            || $request->filled('search')
            || $programId
            || (in_array($yearFilter, $validYearFilters, true) && $request->filled('year1'))
            || in_array($statusFilter, ['Available', 'Borrowed'], true);

        if (! $hasActiveQuery) {
            $perPage = PerPage::resolve($request, 10);
            $books = new LengthAwarePaginator([], 0, $perPage, 1, [
                'path' => $request->url(),
                'query' => $request->query(),
            ]);

            return Inertia::render('Books/Index', [
                'library_books' => $books,
                'library_programs' => $programs,
                'filters' => $this->catalogFiltersFromRequest($request),
                'hasActiveQuery' => false,
            ]);
        }

        $filteredQuery = LibraryBook::query()->whereNull('archived_at');

        if (in_array($statusFilter, ['Available', 'Borrowed'], true)) {
            $filteredQuery->where('availability', $statusFilter);
        }

        if ($programId) {
            $filteredQuery->whereHas('library_programs', function ($q) use ($programId) {
                $q->where('programs.id', $programId);
            });
        }

        if (in_array($yearFilter, $validYearFilters, true) && $request->filled('year1')) {
            $year1 = (int) $request->input('year1');
            $year2 = (int) $request->input('year2');

            switch ($yearFilter) {
                case 'exact':
                    $filteredQuery->where('pub_year', $year1);
                    break;
                case 'before':
                    $filteredQuery->where('pub_year', '<=', $year1);
                    break;
                case 'after':
                    $filteredQuery->where('pub_year', '>=', $year1);
                    break;
                case 'between':
                    if ($request->filled('year2')) {
                        $filteredQuery->whereBetween('pub_year', [min($year1, $year2), max($year1, $year2)]);
                    }
                    break;
            }
        }

        $this->applyBookSearch($filteredQuery, $request->input('search'));

        $books = DB::table(DB::raw("({$filteredQuery->toSql()}) as sub"))
            ->mergeBindings($filteredQuery->getQuery())
            ->select(
                'main_author',
                'title_statement',
                'pub_year',
                'content_type',
                DB::raw('COUNT(*) as copies'),
                DB::raw('MIN(id) as sample_id')
            )
            ->groupBy('main_author', 'title_statement', 'pub_year', 'content_type')
            ->orderBy('title_statement')
            ->paginate(PerPage::resolve($request, 10))
            ->withQueryString();

        $singleCopyIds = collect($books->items())
            ->filter(fn ($row) => (int) $row->copies === 1)
            ->pluck('sample_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $availabilityById = $singleCopyIds === []
            ? []
            : LibraryBook::query()->whereIn('id', $singleCopyIds)->pluck('availability', 'id')->all();

        $books->through(function ($row) use ($availabilityById) {
            $sampleId = (int) $row->sample_id;
            $copies = (int) $row->copies;

            return [
                'title_statement' => $row->title_statement,
                'main_author' => $row->main_author,
                'pub_year' => $row->pub_year,
                'content_type' => $row->content_type,
                'copies' => $copies,
                'sample_id' => $sampleId,
                'availability' => $copies === 1 ? ($availabilityById[$sampleId] ?? null) : null,
            ];
        });

        return Inertia::render('Books/Index', [
            'library_books' => $books,
            'library_programs' => $programs,
            'filters' => $this->catalogFiltersFromRequest($request),
            'hasActiveQuery' => true,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function catalogFiltersFromRequest(Request $request): array
    {
        return [
            'show_all' => $request->boolean('show_all'),
            'search' => $request->input('search', ''),
            'program' => $request->input('program', ''),
            'year_filter' => $request->input('year_filter', ''),
            'year1' => $request->input('year1', ''),
            'year2' => $request->input('year2', ''),
            'status' => $request->input('status', ''),
            'per_page' => (string) PerPage::resolve($request, 10),
        ];
    }

    public function viewCopies(Request $request)
    {
        // Validate that nullable params exist
        if (! $request->filled('title') || ! $request->filled('author') || ! $request->filled('year')) {
            abort(404, 'Missing book group information.');
        }

        $title = $request->title;
        $author = $request->author;
        $year = $request->year;

        // Get all copies matching the same group
        $copies = LibraryBook::whereNull('archived_at')
            ->where('title_statement', $title)
            ->where('main_author', $author)
            ->where('pub_year', $year)
            ->orderBy('accession_no', 'asc')
            ->paginate(PerPage::resolve($request, 10))
            ->withQueryString(); // Keep URL parameters when switching pages

        return view('books.copies', compact('copies', 'title', 'author', 'year'));
    }

    /**
     * Public OPAC JSON for grouped title: holdings list, description fields, optional MARC lines.
     */
    public function opacBookDetails(LibraryBook $book)
    {
        LibraryBookReservation::expireStale();

        if ($book->archived_at !== null) {
            abort(404);
        }

        $copies = LibraryBook::query()
            ->whereNull('archived_at')
            ->where('title_statement', $book->title_statement)
            ->where('main_author', $book->main_author)
            ->where('pub_year', $book->pub_year)
            ->orderBy('accession_no')
            ->get([
                'id',
                'accession_no',
                'call_number',
                'volume',
                'barcode',
                'rfid',
                'availability',
                'reserved',
                'course',
                'section',
                'library_name',
                'content_type',
                'title_statement',
                'main_author',
                'pub_year',
            ]);

        $physicalParts = array_values(array_filter([
            $book->pages ? trim((string) $book->pages).' p.' : null,
            $book->illustrations ? trim((string) $book->illustrations) : null,
            $book->size ? trim((string) $book->size).' cm' : null,
        ]));
        $physicalDesc = $physicalParts !== [] ? implode(' ', $physicalParts) : null;

        $published = trim(implode(' ', array_filter([
            $book->pub_place,
            $book->publisher,
            $book->pub_year !== null && $book->pub_year !== '' ? (string) $book->pub_year : null,
        ])));

        $copyIds = $copies->pluck('id')->all();

        $fullBooks = $copyIds === []
            ? collect()
            : LibraryBook::query()
                ->whereNull('archived_at')
                ->whereIn('id', $copyIds)
                ->orderBy('accession_no')
                ->get();

        $rep = $fullBooks->firstWhere('id', $book->id) ?? $fullBooks->first() ?? $book;
        $rep->loadMissing('library_programs');
        $fullBooks->loadMissing('library_programs');

        $marcViewRows = $this->opacMarcViewRowsForGroupedTitle($rep, $fullBooks);

        $patronHolds = $copyIds === []
            ? collect()
            : LibraryBookReservation::query()
                ->whereIn('book_id', $copyIds)
                ->active()
                ->get()
                ->keyBy('book_id');

        return response()->json([
            'group' => [
                'title' => $book->title_statement,
                'author' => $book->main_author,
                'year' => $book->pub_year,
            ],
            'description' => [
                'main_author' => $book->main_author,
                'title' => $book->title_statement,
                'format' => $book->content_type,
                'edition' => $book->edition,
                'published' => $published !== '' ? $published : null,
                'isbn' => $book->isbn,
                'general_note' => $book->general_note,
                'physical_description' => $physicalDesc,
                'bibliography' => $book->bibliography_note,
                'subject_topic' => $book->subject_topic,
                'subject_form' => $book->subject_form,
                'genre' => $book->genre,
                'series' => $book->series_title,
            ],
            'copies' => $copies->map(function (LibraryBook $c) use ($patronHolds) {
                $patronHold = $patronHolds->get($c->id);
                $statusLabel = match ($c->availability) {
                    'Available' => 'On-Shelf',
                    'Borrowed' => 'Checked out',
                    'On Hold' => 'On hold',
                    default => $c->availability ?? '—',
                };

                return [
                    'id' => $c->id,
                    'accession_no' => $c->accession_no,
                    'call_number' => $c->call_number,
                    'volume' => $c->volume,
                    'copy_no' => null,
                    'collection' => $c->course,
                    'shelving_location' => trim(implode(' — ', array_filter([$c->library_name, $c->section]))),
                    'circulation_type' => $c->isReserved() ? 'Reserved (room use only)' : 'Regular circulation',
                    'circulation_status' => $statusLabel,
                    'availability' => $c->availability,
                    'reserved' => $c->isReserved(),
                    'patron_hold' => (bool) $patronHold,
                    'patron_hold_status' => $patronHold?->status,
                    'barcode' => $c->barcode,
                    'rfid' => $c->rfid,
                ];
            })->values(),
            'marc_view_rows' => $marcViewRows,
        ]);
    }

    /**
     * MARC-style rows aligned with {@see \App\Http\Controllers\BookController::show} / books.show — only fields
     * that are non-empty on the representative copy and identical on every copy in the group.
     *
     * @param  Collection<int, Book>  $fullBooks
     * @return list<array{label: string, value: string}>
     */
    protected function opacMarcViewRowsForGroupedTitle(LibraryBook $rep, $fullBooks): array
    {
        return $this->marcDisplay->opacRowsForGroupedTitle($rep, $fullBooks);
    }

    public function viewCopiesStaff(Request $request)
    {
        if (! $request->filled('title') || ! $request->filled('author') || ! $request->filled('year')) {
            abort(404, 'Missing book group information.');
        }

        $title = $request->title;
        $author = $request->author;
        $year = $request->year;

        $copies = LibraryBook::whereNull('archived_at')
            ->where('title_statement', $title)
            ->where('main_author', $author)
            ->where('pub_year', $year)
            ->orderBy('accession_no', 'asc')
            ->paginate(PerPage::resolve($request, 10))
            ->withQueryString();

        return Inertia::render('Library/Books/CopiesStaff', [
            'copies' => $copies,
            'title' => $title,
            'author' => $author,
            'year' => $year,
        ]);
    }

    public function landingPage(Request $request)
    {
        $viewMode = (string) $request->input('view', 'books');
        $viewMode = in_array($viewMode, ['books', 'ebooks', 'library_books', 'library_ebooks'], true)
            ? ($viewMode === 'library_ebooks' ? 'ebooks' : ($viewMode === 'library_books' ? 'books' : $viewMode))
            : 'books';

        $searchActive =
            $viewMode === 'ebooks' ||
            ($request->filled('search') && trim((string) $request->input('search')) !== '');

        // ----------------------
        // 1) Carousel (recent rows, always unfiltered) + grouped stats (same as OPAC)
        // ----------------------
        // 1) Carousel: one card per title (title + author + year), newest groups first.
        $carouselGroup = LibraryBook::query()
            ->whereNull('archived_at')
            ->select(
                'title_statement',
                'main_author',
                'pub_year',
                DB::raw('COUNT(*) AS copies'),
                DB::raw('MIN(id) AS sample_id'),
                DB::raw("MAX(CASE WHEN availability = 'Available' THEN 1 ELSE 0 END) AS is_available")
            )
            ->groupBy('title_statement', 'main_author', 'pub_year')
            ->orderByDesc(DB::raw('MAX(created_at)'))
            ->limit(12);

        $carouselGroupRows = DB::table(DB::raw("({$carouselGroup->toSql()}) as grouped"))
            ->mergeBindings($carouselGroup->getQuery())
            ->select('grouped.sample_id', 'grouped.copies', 'grouped.is_available')
            ->get();

        $carouselSampleIds = $carouselGroupRows->pluck('sample_id')->all();
        $carouselBooksById = $carouselSampleIds === []
            ? collect()
            : LibraryBook::query()->whereIn('id', $carouselSampleIds)->get()->keyBy('id');

        $carouselBooks = collect($carouselSampleIds)
            ->map(fn ($id) => $carouselBooksById->get($id))
            ->filter()
            ->values();

        $carouselMeta = [];
        foreach ($carouselGroupRows as $row) {
            $carouselMeta[(int) $row->sample_id] = [
                'copies' => (int) $row->copies,
                'is_available' => (int) $row->is_available === 1,
            ];
        }

        $carouselStatLookup = $this->carouselGroupStatsLookup($carouselBooks);
        $carouselMeta = [];
        foreach ($carouselBooks as $cb) {
            $key = $cb->title_statement."\0".$cb->main_author."\0".$cb->pub_year;
            $carouselMeta[$cb->id] = $carouselStatLookup[$key] ?? [
                'copies' => 1,
                'is_available' => $cb->availability === 'Available',
            ];
        }

        $ebooks = null;
        $perPage = PerPage::resolve($request, 20);

        if ($viewMode === 'ebooks') {
            $q = LibraryEbook::query();
            if ($request->filled('search')) {
                $term = trim((string) $request->input('search'));
                $q->where(function ($w) use ($term) {
                    $like = '%'.$term.'%';
                    $w->where('title', 'like', $like)
                        ->orWhere('author', 'like', $like)
                        ->orWhere('publisher', 'like', $like)
                        ->orWhere('source', 'like', $like)
                        ->orWhere('publication_year', 'like', $like);
                });
            }

            $ebooks = $q->orderBy('title')->paginate($perPage)->withQueryString();

            // Keep `$books` as empty paginator to avoid blade errors on counts.
            $currentPage = max(1, (int) $request->input('page', 1));
            $books = new LengthAwarePaginator([], 0, $perPage, $currentPage, [
                'path' => $request->url(),
                'pageName' => 'page',
            ]);
            $books->withQueryString();
        } elseif (! $searchActive) {
            $currentPage = max(1, (int) $request->input('page', 1));
            $books = new LengthAwarePaginator([], 0, $perPage, $currentPage, [
                'path' => $request->url(),
                'pageName' => 'page',
            ]);
            $books->withQueryString();
        } else {
            // ----------------------
            // 2) Base Eloquent query (filters + search) — only after a non-empty search
            // ----------------------
            $query = LibraryBook::query()->whereNull('archived_at');

            if ($request->filled('course') && $request->course !== 'all') {
                $query->where('course', $request->course);
            }

            if ($request->filled('subject_topic') && $request->subject_topic !== 'All') {
                $query->where('subject_topic', $request->subject_topic);
            }

            if ($request->filled('genre') && $request->genre !== 'All') {
                $query->where('genre', $request->genre);
            }

            if ($request->filled('content_type') && $request->content_type !== 'All') {
                $query->where('content_type', $request->content_type);
            }

            if ($request->filled('section') && $request->section !== 'All') {
                $query->where('section', $request->section);
            }

            $this->applyBookSearch($query, $request->input('search'));

            // ----------------------
            // 3) Grouped subquery (count copies, get a sample id, detect availability)
            // ----------------------
            $grouped = $query->getQuery()->clone()
                ->select(
                    'title_statement',
                    'main_author',
                    'pub_year',
                    DB::raw('COUNT(*) AS copies'),
                    DB::raw('MIN(id) AS sample_id'),
                    DB::raw("MAX(CASE WHEN availability = 'Available' THEN 1 ELSE 0 END) AS is_available")
                )
                ->groupBy('title_statement', 'main_author', 'pub_year');

            // ----------------------
            // 4) Join grouped subquery back to books to grab sample fields
            // ----------------------
            $books = DB::table(DB::raw("({$grouped->toSql()}) as grouped"))
                ->mergeBindings($grouped)
                ->join('library_books', 'books.id', '=', 'grouped.sample_id')
                ->select(
                    'grouped.title_statement',
                    'grouped.main_author',
                    'grouped.pub_year',
                    'grouped.copies',
                    'grouped.sample_id as id',
                    'grouped.is_available',
                    'books.call_number',
                    'books.general_note',
                    'books.cover_image',
                    'books.rfid',
                    'books.barcode',
                    'books.content_type',
                    'books.fixed_length_data',
                    'books.library_name',
                    'books.course'
                )
                ->orderBy('grouped.title_statement')
                ->paginate($perPage)
                ->withQueryString();
        }

        // ----------------------
        // 5) Distinct dropdown sources (always from full table)
        // ----------------------
        $subjectTopics = LibraryBook::select('subject_topic')
            ->distinct()
            ->whereNull('archived_at')
            ->whereNotNull('subject_topic')
            ->orderBy('subject_topic')
            ->pluck('subject_topic');

        $genres = LibraryBook::select('genre')
            ->distinct()
            ->whereNull('archived_at')
            ->whereNotNull('genre')
            ->orderBy('genre')
            ->pluck('genre');

        $content_type = LibraryBook::select('content_type')
            ->distinct()
            ->whereNull('archived_at')
            ->whereNotNull('content_type')
            ->orderBy('content_type')
            ->pluck('content_type');

        $sections = LibraryBook::select('section')
            ->distinct()
            ->whereNull('archived_at')
            ->whereNotNull('section')
            ->orderBy('section')
            ->pluck('section');

        $courses = LibraryBook::select('course')
            ->distinct()
            ->whereNull('archived_at')
            ->whereNotNull('course')
            ->orderBy('course')
            ->pluck('course');

        // ----------------------
        // 6) Return view
        // ----------------------
        $library_books = $books;
        $library_ebooks = $ebooks;
        $programs = LibraryProgram::orderBy('program_name')->get();

        return Inertia::render('Opac/Landing', [
            'programs',
            'carouselBooks',
            'carouselMeta',
            'libraryBooks' => $library_books ?? $books,
            'libraryEbooks' => $library_ebooks ?? $ebooks,
            'filters' => [
                'subjectTopics' => $subjectTopics,
                'genres' => $genres,
                'sections' => $sections,
                'courses' => $courses,
                'contentTypes' => $content_type,
                'search' => (string) $request->input('search', ''),
                'viewMode' => $viewMode,
                'searchActive' => $searchActive,
            ],
        ]);
    }

    /**
     * Copy count + "any available" per title/author/year for carousel cards (matches OPAC grouping).
     *
     * @param  Collection<int, Book>  $carouselBooks
     * @return array<string, array{copies: int, is_available: bool}>
     */
    protected function carouselGroupStatsLookup($carouselBooks): array
    {
        if ($carouselBooks->isEmpty()) {
            return [];
        }

        $tuples = $carouselBooks->map(fn (LibraryBook $b) => [
            'title_statement' => $b->title_statement,
            'main_author' => $b->main_author,
            'pub_year' => $b->pub_year,
        ])->unique(fn (array $t) => $t['title_statement']."\0".$t['main_author']."\0".$t['pub_year'])
            ->values();

        $query = LibraryBook::query()
            ->select('title_statement', 'main_author', 'pub_year')
            ->selectRaw('COUNT(*) as copies')
            ->selectRaw("MAX(CASE WHEN availability = 'Available' THEN 1 ELSE 0 END) as is_available");

        $query->where(function ($outer) use ($tuples) {
            foreach ($tuples as $t) {
                $outer->orWhere(function ($w) use ($t) {
                    $w->where('title_statement', $t['title_statement'])
                        ->where('main_author', $t['main_author'])
                        ->where('pub_year', $t['pub_year']);
                });
            }
        });

        $rows = $query->groupBy('title_statement', 'main_author', 'pub_year')->get();

        $lookup = [];
        foreach ($rows as $row) {
            $k = $row->title_statement."\0".$row->main_author."\0".$row->pub_year;
            $lookup[$k] = [
                'copies' => (int) $row->copies,
                'is_available' => (int) $row->is_available === 1,
            ];
        }

        return $lookup;
    }

    public function destroy(LibraryBook $book)
    {
        AdminActivityLogger::catalog('deleted', $book);
        $book->delete();

        return redirect()->route('library.book.index')->with('success', 'Book deleted successfully!');
    }

    public function archivedIndex(Request $request)
    {
        $books = LibraryBook::query()
            ->whereNotNull('archived_at')
            ->orderByDesc('archived_at')
            ->paginate(PerPage::resolve($request, 20))
            ->withQueryString();

        return Inertia::render('Library/Books/Archived', [
            'books' => $books,
        ]);
    }

    public function trashIndex(Request $request)
    {
        $books = LibraryBook::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->paginate(PerPage::resolve($request, 20))
            ->withQueryString();

        return Inertia::render('Library/Books/Trash', [
            'books' => $books,
        ]);
    }

    public function archive(LibraryBook $book)
    {
        if ($book->archived_at === null) {
            $book->archived_at = Carbon::now();
            $book->save();
            AdminActivityLogger::catalog('archived', $book);
        }

        return back()->with('success', 'Book archived.');
    }

    public function unarchive(LibraryBook $book)
    {
        if ($book->archived_at !== null) {
            $book->archived_at = null;
            $book->save();
            AdminActivityLogger::catalog('unarchived', $book);
        }

        return back()->with('success', 'Book restored from archive.');
    }

    public function restoreTrashed(int $id)
    {
        $book = LibraryBook::onlyTrashed()->findOrFail($id);
        $book->restore();
        AdminActivityLogger::catalog('restored', $book);

        return back()->with('success', 'Book restored.');
    }

    public function forceDeleteTrashed(int $id)
    {
        $book = LibraryBook::onlyTrashed()->with(['library_programs', 'marcFields', 'logs'])->findOrFail($id);
        $title = $book->title_statement;

        DB::transaction(function () use ($book) {
            $book->programs()->detach();
            $book->marcFields()->delete();
            $book->logs()->delete();
            $book->forceDelete();
        });

        AdminActivityLogger::staff(
            AdminActivity::TYPE_CATALOG,
            'Book permanently deleted',
            "«{$title}»",
            route('library.books.trash'),
            'book',
        );

        return back()->with('success', 'Book permanently deleted.');
    }

    public function create()
    {
        $programs = LibraryProgram::orderBy('program_name')->get();

        $framework = $this->booksFramework();
        $frameworkFields = $framework?->fields ?? collect();

        return view('books.create', compact('library_programs', 'frameworkFields'));
    }

    /**
     * Prospectus courses (program_courses.course_name) for one or more programs — cataloging AJAX.
     */
    public function coursesForPrograms(Request $request)
    {
        $ids = $request->input('program_ids', []);
        if (! is_array($ids)) {
            $ids = array_filter([$ids]);
        }
        $ids = array_values(array_unique(array_filter(array_map('intval', $ids))));

        if ($ids === []) {
            return response()->json([]);
        }

        $names = LibraryProgramCourse::query()
            ->whereHas('year', static function ($q) use ($ids) {
                $q->whereIn('program_id', $ids);
            })
            ->orderBy('course_name')
            ->pluck('course_name')
            ->map(fn ($n) => trim((string) $n))
            ->filter()
            ->unique(fn ($n) => mb_strtolower($n))
            ->values();

        return response()->json($names);
    }

    public function store(Request $request)
    {
        $this->normalizeProgramIdsOnRequest($request);

        $multipleCopies = $request->boolean('multiple_copies');

        $request->validate([
            'multiple_copies' => 'nullable|boolean',
            'copies' => $multipleCopies ? 'required|array|min:1' : 'nullable|array',
            'copies.*.accession_no' => 'nullable|string|max:255',
            'copies.*.rfid' => 'nullable|string|max:255',
            'program_ids' => 'nullable|array',
            'program_ids.*' => 'integer|exists:programs,id',
            'year' => 'nullable|string|max:255',
            'course' => 'nullable|string|max:255',
            'curriculum' => 'nullable|string|in:'.implode(',', array_keys(config('catalog.curriculum_options', []))),
            'reserved' => 'nullable|boolean',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'external_cover_url' => 'nullable|string|max:2048',
            'catalog_source' => 'nullable|string|in:openlibrary,googlebooks',
        ]);

        if ($multipleCopies) {
            $this->validateCopyRows($request);
        }

        $framework = $this->booksFramework();
        $marc = $this->extractMarcPayload($request);
        if ($multipleCopies) {
            $marc = $this->stripCopyIdentifiersFromMarc($marc);
        }

        try {
            $result = DB::transaction(function () use ($request, $framework, $marc, $multipleCopies) {
                $coverPath = $this->resolveCoverPathOnStore($request);

                $shared = [
                    'availability' => 'Available',
                    'year' => $request->year,
                    'course' => $request->course,
                    'curriculum' => $request->curriculum,
                    'reserved' => $request->boolean('reserved'),
                    'cover_image' => $coverPath,
                ];

                if (! $multipleCopies) {
                    $book = LibraryBook::create($shared);
                    $this->saveMarcFieldsForBook($book, $framework, $marc);
                    $this->assertCopyUniqueOnBook($book);

                    if (! empty($request->program_ids)) {
                        $book->programs()->attach($request->program_ids);
                    }

                    return ['book' => $book, 'count' => 1];
                }

                $created = [];
                foreach ($request->input('copies', []) as $copy) {
                    if (! is_array($copy)) {
                        continue;
                    }
                    $acc = trim((string) ($copy['accession_no'] ?? ''));
                    $rfid = trim((string) ($copy['rfid'] ?? ''));
                    if ($acc === '' && $rfid === '') {
                        continue;
                    }

                    $book = LibraryBook::create($shared);
                    $copyMarc = $this->applyCopyIdentifiersToMarc($marc, $copy);
                    $this->saveMarcFieldsForBook($book, $framework, $copyMarc);
                    $this->assertCopyUniqueOnBook($book);

                    if (! empty($request->program_ids)) {
                        $book->programs()->attach($request->program_ids);
                    }

                    $created[] = $book;
                }

                if (count($created) === 0) {
                    throw ValidationException::withMessages([
                        'copies' => ['Add at least one copy with an accession number and/or RFID.'],
                    ]);
                }

                return ['book' => $created[0], 'count' => count($created)];
            });

            $book = $result['book'];
            $copyCount = $result['count'];
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            \Log::error('Book store failed: '.$e->getMessage(), ['exception' => $e]);

            return back()
                ->withInput()
                ->with('error', 'Could not save the book: '.$e->getMessage());
        }

        if (in_array($request->input('catalog_source'), ['openlibrary', 'googlebooks'], true)) {
            $returnIsbn = $book->isbn ?: $request->input('openlibrary_return_isbn');
            if ($returnIsbn) {
                $msg = $copyCount > 1
                    ? "{$copyCount} copies saved successfully."
                    : 'Book saved successfully.';

                AdminActivityLogger::catalog(
                    'created',
                    $book,
                    $copyCount > 1 ? "{$copyCount} copies" : null,
                );

                return redirect()
                    ->route('library.catalog.copy.openlibrary.search', ['isbn' => $returnIsbn])
                    ->with('success', $msg);
            }
        }

        $msg = $copyCount > 1
            ? "{$copyCount} copies added successfully!"
            : 'Book added successfully!';

        AdminActivityLogger::catalog(
            'created',
            $book,
            $copyCount > 1 ? "{$copyCount} copies" : null,
        );

        return redirect()->route('library.book.index')->with('success', $msg);
    }

    protected function resolveCoverPathOnStore(Request $request): ?string
    {
        if ($request->hasFile('cover_image')) {
            Storage::disk('public')->makeDirectory('covers');

            return PublicStoragePublisher::publish(
                $request->file('cover_image')->store('covers', 'public')
            );
        }

        if ($request->filled('external_cover_url')) {
            $url = trim((string) $request->input('external_cover_url'));
            if ($url !== '' && filter_var($url, FILTER_VALIDATE_URL)) {
                try {
                    $resp = Http::timeout(25)->get($url);
                    if ($resp->successful() && strlen($resp->body()) > 0) {
                        $ext = strtolower((string) pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
                        if (! in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
                            $ext = 'jpg';
                        }
                        $coverPath = 'covers/ol_'.Str::random(12).'.'.$ext;
                        Storage::disk('public')->put($coverPath, $resp->body());

                        return PublicStoragePublisher::publish($coverPath);
                    }
                } catch (\Throwable $e) {
                    \Log::warning('external_cover_url download failed: '.$e->getMessage());
                }
            }
        }

        return null;
    }

    public function show($id)
    {
        $book = LibraryBook::with(['library_programs', 'marcFields'])->findOrFail($id);
        $marcDetailSections = $this->marcDisplay->detailSectionsForBook($book);

        return view('books.show', compact('book', 'marcDetailSections'));
    }

    public function edit($id)
    {
        $book = LibraryBook::with(['library_programs', 'marcFields'])->findOrFail($id);
        $programs = LibraryProgram::orderBy('program_name')->get();

        $framework = $this->booksFramework();
        $frameworkFields = $framework?->fields ?? collect();
        $marcValues = $this->marcValuesForBook($book, $frameworkFields);

        return view('books.edit', compact('book', 'library_programs', 'frameworkFields', 'marcValues'));
    }

    public function update(Request $request, $id)
    {
        $book = LibraryBook::findOrFail($id);

        $this->normalizeProgramIdsOnRequest($request);

        $addCopies = $request->boolean('add_copies');

        $request->validate([
            'add_copies' => 'nullable|boolean',
            'copies' => $addCopies ? 'required|array|min:1' : 'nullable|array',
            'copies.*.accession_no' => 'nullable|string|max:255',
            'copies.*.rfid' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:255',
            'course' => 'nullable|string|max:255',
            'curriculum' => 'nullable|string|in:'.implode(',', array_keys(config('catalog.curriculum_options', []))),
            'reserved' => 'nullable|boolean',
            'program_ids' => 'nullable|array',
            'program_ids.*' => 'integer|exists:programs,id',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($addCopies) {
            $this->validateCopyRows($request);
        }

        $framework = $this->booksFramework();
        $marc = $this->extractMarcPayload($request);

        $addedCopyCount = DB::transaction(function () use ($request, $book, $framework, $marc, $addCopies) {
            $data = $request->only(['year', 'course', 'curriculum']);
            $data['reserved'] = $request->boolean('reserved');

            if ($request->hasFile('cover_image')) {
                Storage::disk('public')->makeDirectory('covers');
                $data['cover_image'] = PublicStoragePublisher::publish(
                    $request->file('cover_image')->store('covers', 'public')
                );
            }

            $book->update($data);
            $this->saveMarcFieldsForBook($book, $framework, $marc);
            $this->assertCopyUniqueOnBook($book);

            if (! empty($request->program_ids)) {
                $book->programs()->sync($request->program_ids);
            } else {
                $book->programs()->detach();
            }

            if (! $addCopies) {
                return 0;
            }

            $book->refresh();

            return $this->createAdditionalCopiesFromBook($book, $request, $framework, $marc);
        });

        $message = $addedCopyCount > 0
            ? "Book updated successfully. {$addedCopyCount} additional ".($addedCopyCount === 1 ? 'copy' : 'copies').' added.'
            : 'Book updated successfully!';

        AdminActivityLogger::catalog(
            'updated',
            $book->fresh(),
            $addedCopyCount > 0 ? "{$addedCopyCount} copies added" : null,
        );

        return redirect()->route('library.book.index')->with('success', $message);
    }

    public function getYears(Request $request)
    {
        $program = $request->program;
        $years = LibraryBook::where('program', $program)
            ->select('year')->distinct()->orderBy('year')->pluck('year');

        return response()->json($years);
    }

    public function getCourses(Request $request)
    {
        $program = $request->program;
        $year = $request->year;
        $courses = LibraryBook::where('program', $program)
            ->where('year', $year)
            ->select('course')->distinct()->orderBy('course')->pluck('course');

        return response()->json($courses);
    }

    public function downloadBookReport()
    {
        // Count total books per title
        $booksByTitle = LibraryBook::select('title_statement')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('title_statement')
            ->orderBy('title_statement')
            ->get();

        $totalBooks = $booksByTitle->sum('total');

        // Get all subjects grouped by course
        $books = DB::table('library_books')
            ->select('course', 'title_statement')
            ->groupBy('course', 'title_statement')
            ->orderBy('course')
            ->orderBy('title_statement')
            ->get();

        $groupedBooks = $books->groupBy('course');

        // Pass both variables to the view
        $pdf = Pdf::loadView('pdf.book_report', compact('booksByTitle', 'totalBooks', 'groupedBooks'));

        return $pdf->download('book_report.pdf');
    }
}
