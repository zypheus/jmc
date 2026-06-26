<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryMarcField;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogMarcSelectOptionsController extends Controller
{
    public function index()
    {
        $sections = [];

        foreach (config('catalog.extensible_select_marc', []) as $def) {
            $marc = LibraryMarcField::findForTagSubfield($def['tag'], $def['subfield'] ?? null);
            if (! $marc) {
                continue;
            }

            $saved = LibraryMarcField::normalizeOptionsArray($marc->options);
            $merged = $marc->mergedSelectOptions($def['book_column'] ?? null);
            $savedLower = array_map('mb_strtolower', $saved);
            $fromRecords = array_values(array_filter($merged, function ($opt) use ($savedLower) {
                return ! in_array(mb_strtolower($opt), $savedLower, true);
            }));

            $sections[] = [
                'def' => $def,
                'marc' => $marc,
                'saved' => $saved,
                'from_records' => $fromRecords,
            ];
        }

        return Inertia::render('Library/Admin/CatalogSelectOptions/Index', [
            'sections' => $sections,
            'activeField' => (string) request('field', ''),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'tag' => ['required', 'string', 'size:3', 'regex:/^[0-9]{3}$/'],
            'subfield' => ['nullable', 'string', 'size:1'],
            'option' => ['required', 'string', 'max:255'],
        ]);

        $subfield = filled($data['subfield'] ?? null) ? $data['subfield'] : null;

        if (! LibraryMarcField::isExtensibleSelect($data['tag'], $subfield)) {
            abort(403);
        }

        $marc = LibraryMarcField::findForTagSubfield($data['tag'], $subfield);

        if (! $marc || $marc->input_type !== 'select') {
            return back()->with('error', 'MARC select field not found. Run migrations or seed catalog frameworks.');
        }

        $option = trim($data['option']);
        $options = LibraryMarcField::normalizeOptionsArray($marc->options);
        $exists = collect($options)->contains(fn ($o) => strcasecmp($o, $option) === 0);

        if (! $exists) {
            $options[] = $option;
            sort($options, SORT_NATURAL | SORT_FLAG_CASE);
            $marc->options = $options;
            $marc->save();
        }

        AdminActivityLogger::staff(
            AdminActivity::TYPE_SETTINGS,
            $exists ? 'Catalog option unchanged' : 'Catalog dropdown option added',
            "{$data['tag']}{$subfield}: {$option}",
            route('library.admin.catalog_select_options.index'),
            'book',
            $marc,
        );

        return redirect()
            ->route('library.admin.catalog_select_options.index', ['field' => $data['tag'].($subfield ?? '')])
            ->with('success', $exists ? 'That option already exists.' : "Added \"{$option}\".");
    }

    public function destroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'tag' => ['required', 'string', 'size:3', 'regex:/^[0-9]{3}$/'],
            'subfield' => ['nullable', 'string', 'size:1'],
            'option' => ['required', 'string', 'max:255'],
        ]);

        $subfield = filled($data['subfield'] ?? null) ? $data['subfield'] : null;

        if (! LibraryMarcField::isExtensibleSelect($data['tag'], $subfield)) {
            abort(403);
        }

        $marc = LibraryMarcField::findForTagSubfield($data['tag'], $subfield);

        if (! $marc) {
            return back()->with('error', 'MARC field not found.');
        }

        $remove = trim($data['option']);
        $options = array_values(array_filter(
            LibraryMarcField::normalizeOptionsArray($marc->options),
            fn ($o) => strcasecmp($o, $remove) !== 0
        ));

        $marc->options = $options ?: null;
        $marc->save();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_SETTINGS,
            'Catalog dropdown option removed',
            "{$data['tag']}{$subfield}: {$remove}",
            route('library.admin.catalog_select_options.index'),
            'book',
            $marc,
        );

        return redirect()
            ->route('library.admin.catalog_select_options.index', ['field' => $data['tag'].($subfield ?? '')])
            ->with('success', "Removed \"{$remove}\" from the list.");
    }
}
