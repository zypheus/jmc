<?php

namespace App\Http\Controllers\Library;

use App\Domain\Library\Models\AdminActivity;
use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryCatalogFramework;
use App\Domain\Library\Models\LibraryCatalogFrameworkField;
use App\Domain\Library\Models\LibraryMarcField;
use App\Domain\Library\Services\AdminActivityLogger;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CatalogFrameworkAdminController extends Controller
{
    protected function allowedBookColumns(): array
    {
        $exclude = ['created_at', 'updated_at', 'availability', 'cover_image'];

        return array_values(array_diff((new LibraryBook)->getFillable(), $exclude));
    }

    public function index()
    {
        $frameworks = LibraryCatalogFramework::orderBy('name')->get();

        return Inertia::render('Library/Admin/CatalogFrameworks/Index', [
            'frameworks' => $frameworks,
        ]);
    }

    public function edit(LibraryCatalogFramework $catalog_framework)
    {
        $catalog_framework->load([
            'fields' => static function ($q) {
                $q->orderBy('sort_order')->with('marcField');
            },
        ]);

        $attachedIds = $catalog_framework->fields->pluck('marc_field_id')->filter()->all();

        $availableMarcFields = LibraryMarcField::query()
            ->when($attachedIds !== [], fn ($q) => $q->whereNotIn('id', $attachedIds))
            ->orderBy('tag')
            ->orderBy('subfield')
            ->get();

        $bookColumns = $this->allowedBookColumns();

        return Inertia::render('Library/Admin/CatalogFrameworks/Edit', [
            'catalog_framework' => $catalog_framework,
            'availableMarcFields' => $availableMarcFields,
            'bookColumns' => $bookColumns,
            'inputTypes' => ['text', 'textarea', 'select', 'date', 'time', 'datetime'],
        ]);
    }

    public function updateFields(Request $request, LibraryCatalogFramework $catalog_framework)
    {
        $allowed = $this->allowedBookColumns();

        $request->validate([
            'fields' => ['required', 'array'],
            'fields.*.visible' => ['nullable', 'in:0,1'],
            'fields.*.required' => ['nullable', 'in:0,1'],
            'fields.*.sort_order' => ['nullable', 'integer', 'min:0', 'max:99999'],
            'fields.*.default_value' => ['nullable', 'string', 'max:255'],
            'fields.*.book_column' => ['nullable', 'string', 'max:64', Rule::in($allowed)],
        ]);

        foreach ($request->input('fields', []) as $id => $row) {
            $field = LibraryCatalogFrameworkField::query()
                ->where('framework_id', $catalog_framework->id)
                ->where('id', (int) $id)
                ->first();

            if (! $field) {
                continue;
            }

            $field->update([
                'visible' => ($row['visible'] ?? '0') === '1',
                'required' => ($row['required'] ?? '0') === '1',
                'sort_order' => (int) ($row['sort_order'] ?? 0),
                'default_value' => $row['default_value'] ?? null,
                'book_column' => $row['book_column'] ?? null,
            ]);
        }

        AdminActivityLogger::staff(
            AdminActivity::TYPE_SETTINGS,
            'Catalog framework updated',
            $catalog_framework->name,
            route('library.admin.catalog_frameworks.edit', $catalog_framework),
            'book',
            $catalog_framework,
        );

        return redirect()
            ->route('library.admin.catalog_frameworks.edit', $catalog_framework)
            ->with('success', 'Framework fields updated.');
    }

    public function attachField(Request $request, LibraryCatalogFramework $catalog_framework)
    {
        $data = $request->validate([
            'marc_field_id' => ['required', 'integer', 'exists:marc_fields,id'],
        ]);

        if ($catalog_framework->fields()->where('marc_field_id', $data['marc_field_id'])->exists()) {
            return back()->withErrors(['marc_field_id' => 'That tag is already in this framework.']);
        }

        $next = (int) $catalog_framework->fields()->max('sort_order') + 1;

        LibraryCatalogFrameworkField::create([
            'framework_id' => $catalog_framework->id,
            'marc_field_id' => $data['marc_field_id'],
            'visible' => true,
            'required' => false,
            'sort_order' => $next,
            'book_column' => null,
            'default_value' => null,
        ]);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_SETTINGS,
            'MARC field added to framework',
            $catalog_framework->name,
            route('library.admin.catalog_frameworks.edit', $catalog_framework),
            'book',
            $catalog_framework,
        );

        return back()->with('success', 'Field added to framework.');
    }

    public function storeMarcField(Request $request, LibraryCatalogFramework $catalog_framework)
    {
        $data = $request->validate([
            'tag' => ['required', 'string', 'size:3', 'regex:/^[0-9]{3}$/'],
            'subfield' => ['nullable', 'string', 'size:1'],
            'label' => ['nullable', 'string', 'max:255'],
            'input_type' => ['required', Rule::in(['text', 'textarea', 'select', 'date', 'time', 'datetime'])],
            'repeatable' => ['nullable', 'in:0,1'],
            'options_lines' => ['nullable', 'string', 'max:5000'],
        ]);

        $options = null;
        if (($data['input_type'] ?? '') === 'select' && ! empty($data['options_lines'])) {
            $options = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $data['options_lines']))));
            if ($options === []) {
                $options = null;
            }
        }

        $subfield = isset($data['subfield']) && $data['subfield'] !== '' ? $data['subfield'] : null;

        try {
            $marc = LibraryMarcField::create([
                'tag' => $data['tag'],
                'subfield' => $subfield,
                'label' => $data['label'] ?? null,
                'repeatable' => ($data['repeatable'] ?? '0') === '1',
                'input_type' => $data['input_type'],
                'options' => $options,
            ]);
        } catch (\Throwable $e) {
            return back()->withErrors(['tag' => 'Could not create tag (duplicate tag + subfield?).'])->withInput();
        }

        $next = (int) $catalog_framework->fields()->max('sort_order') + 1;

        LibraryCatalogFrameworkField::create([
            'framework_id' => $catalog_framework->id,
            'marc_field_id' => $marc->id,
            'visible' => true,
            'required' => false,
            'sort_order' => $next,
            'book_column' => null,
            'default_value' => null,
        ]);

        AdminActivityLogger::staff(
            AdminActivity::TYPE_SETTINGS,
            'MARC tag created',
            "{$data['tag']}{$subfield} — {$catalog_framework->name}",
            route('library.admin.catalog_frameworks.edit', $catalog_framework),
            'book',
            $marc,
        );

        return back()->with('success', 'New MARC tag created and added to this framework.');
    }

    public function detachField(LibraryCatalogFramework $catalog_framework, LibraryCatalogFrameworkField $field)
    {
        if ($field->framework_id !== $catalog_framework->id) {
            abort(404);
        }

        $field->delete();

        AdminActivityLogger::staff(
            AdminActivity::TYPE_SETTINGS,
            'MARC field removed from framework',
            $catalog_framework->name,
            route('library.admin.catalog_frameworks.edit', $catalog_framework),
            'book',
            $catalog_framework,
        );

        return back()->with('success', 'Field removed from framework (MARC definition is kept for reuse).');
    }
}
