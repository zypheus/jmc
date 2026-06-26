<?php

namespace App\Domain\Library\Services;

use App\Domain\Library\Models\LibraryBook;
use App\Domain\Library\Models\LibraryCatalogFramework;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class BookMarcDisplay
{
    public function booksFramework(): ?CatalogFramework
    {
        return LibraryCatalogFramework::where('name', 'Books')
            ->with(['fields' => function ($q) {
                $q->where('visible', true)->orderBy('sort_order')->with('marcField');
            }])
            ->first();
    }

    /**
     * @return array<string, array<string, array<int, string>>>
     */
    public function marcValuesForBook(LibraryBook $book, $frameworkFields = null): array
    {
        $book->loadMissing('marcFields');

        $out = [];
        foreach ($book->marcFields as $mf) {
            $subKey = $mf->subfield ?? '_';
            $out[$mf->tag][$subKey][$mf->occurrence] = $mf->value;
        }

        if (! $frameworkFields) {
            return $out;
        }

        foreach ($frameworkFields as $ff) {
            $mf = $ff->marcField;
            if (! $mf || ! $ff->book_column) {
                continue;
            }

            $tag = $mf->tag;
            $subKey = $mf->subfield ?? '_';
            $existing = $out[$tag][$subKey] ?? [];
            $hasValue = is_array($existing) && count(array_filter($existing, static function ($v) {
                return $v !== null && $v !== '';
            })) > 0;
            if ($hasValue) {
                continue;
            }

            $val = $book->{$ff->book_column} ?? null;
            if ($val === null || $val === '') {
                continue;
            }

            $val = (string) $val;
            if ($mf->repeatable && str_contains($val, ';')) {
                $parts = array_values(array_filter(array_map('trim', explode(';', $val))));
                foreach ($parts as $i => $part) {
                    $out[$tag][$subKey][$i] = $part;
                }
            } else {
                $out[$tag][$subKey][0] = $val;
            }
        }

        return $out;
    }

    /**
     * Accordion sections for staff book show (framework-driven).
     *
     * @return list<array{title: string, rows: list<array{tag: string, label: string, value: string}>}>
     */
    public function detailSectionsForBook(LibraryBook $book): array
    {
        $framework = $this->booksFramework();
        $frameworkFields = $framework?->fields ?? collect();
        $marcValues = $this->marcValuesForBook($book, $frameworkFields);

        $usedBookColumns = $frameworkFields
            ->pluck('book_column')
            ->filter()
            ->all();

        $rowsByGroup = [];
        foreach ($frameworkFields as $ff) {
            $display = $this->displayValueForFrameworkField($book, $ff, $marcValues);
            if ($display === null) {
                continue;
            }

            $mf = $ff->marcField;
            $groupKey = substr($mf->tag, 0, 1);
            $rowsByGroup[$groupKey][] = [
                'tag' => $mf->tag.($mf->subfield ? " ‡{$mf->subfield}" : ''),
                'label' => $mf->label ?: $mf->tag,
                'value' => $display,
            ];
        }

        foreach (config('marc.program_tab_fields', []) as $def) {
            $column = $def['book_column'];
            if (in_array($column, $usedBookColumns, true)) {
                continue;
            }
            $display = $this->formatBookColumnValue($book, $column);
            if ($display === null) {
                continue;
            }
            $groupKey = isset($def['tag']) && $def['tag'] !== '—' ? substr((string) $def['tag'], 0, 1) : '9';
            $rowsByGroup[$groupKey][] = [
                'tag' => (string) ($def['tag'] ?? '—'),
                'label' => (string) $def['label'],
                'value' => $display,
            ];
        }

        if ($book->relationLoaded('library_programs') ? $book->programs->isNotEmpty() : $book->programs()->exists()) {
            $book->loadMissing('library_programs');
            $programNames = $book->programs->sortBy('program_name')->pluck('program_name')->filter()->implode(', ');
            if ($programNames !== '') {
                $rowsByGroup['9'][] = [
                    'tag' => '996',
                    'label' => 'Program(s)',
                    'value' => $programNames,
                ];
            }
        }

        ksort($rowsByGroup);
        $groupTitles = config('marc.group_titles_long', []);

        $sections = [];
        foreach ($rowsByGroup as $groupKey => $rows) {
            $sections[] = [
                'title' => $groupTitles[$groupKey] ?? 'Other fields',
                'rows' => $rows,
            ];
        }

        return $sections;
    }

    /**
     * Flat MARC rows for OPAC when every copy in a title group shares the same value.
     *
     * @param  Collection<int, Book>  $fullBooks
     * @return list<array{label: string, value: string}>
     */
    public function opacRowsForGroupedTitle(LibraryBook $rep, Collection $fullBooks): array
    {
        if ($fullBooks->isEmpty()) {
            return [];
        }

        $framework = $this->booksFramework();
        $frameworkFields = $framework?->fields ?? collect();
        $marcValues = $this->marcValuesForBook($rep, $frameworkFields);

        $usedBookColumns = $frameworkFields
            ->pluck('book_column')
            ->filter()
            ->all();

        $rows = [];

        foreach ($frameworkFields as $ff) {
            $mf = $ff->marcField;
            if (! $mf) {
                continue;
            }

            if ($ff->book_column) {
                if (! $this->booksShareSameAttribute($fullBooks, $ff->book_column)) {
                    continue;
                }
            } else {
                if (! $this->booksShareSameMarcSubfield($fullBooks, $mf->tag, $mf->subfield)) {
                    continue;
                }
            }

            $display = $this->displayValueForFrameworkField($rep, $ff, $marcValues);
            if ($display === null) {
                continue;
            }

            $label = $mf->tag.($mf->subfield ? " ‡{$mf->subfield}" : '');
            if ($mf->label) {
                $label .= ' ('.$mf->label.')';
            }

            $rows[] = ['label' => $label, 'value' => $display];
        }

        foreach (config('marc.program_tab_fields', []) as $def) {
            $column = $def['book_column'];
            if (in_array($column, $usedBookColumns, true)) {
                continue;
            }
            if (! $this->booksShareSameAttribute($fullBooks, $column)) {
                continue;
            }
            $display = $this->formatBookColumnValue($rep, $column);
            if ($display === null) {
                continue;
            }
            $tag = (string) ($def['tag'] ?? '—');
            $rows[] = [
                'label' => $tag !== '—' ? "{$tag} ({$def['label']})" : (string) $def['label'],
                'value' => $display,
            ];
        }

        $rep->loadMissing('library_programs');
        if ($this->opacProgramsShareSame($fullBooks) && $rep->programs->isNotEmpty()) {
            $value = $rep->programs->sortBy('program_name')->pluck('program_name')->filter()->implode(', ');
            if ($value !== '') {
                $rows[] = ['label' => '996 ‡f (Program)', 'value' => $value];
            }
        }

        if ($this->booksShareSameAttribute($fullBooks, 'availability') && filled($rep->availability)) {
            $rows[] = ['label' => 'Status:', 'value' => (string) $rep->availability];
        }

        return $rows;
    }

    public function displayValueForFrameworkField(LibraryBook $book, CatalogFrameworkField $ff, ?array $marcValues = null): ?string
    {
        $mf = $ff->marcField;
        if (! $mf) {
            return null;
        }

        if ($marcValues === null) {
            $framework = $this->booksFramework();
            $marcValues = $this->marcValuesForBook($book, $framework?->fields ?? collect());
        }

        $tag = $mf->tag;
        $subKey = $mf->subfield ?? '_';
        $vals = $marcValues[$tag][$subKey] ?? [];
        if (! is_array($vals)) {
            $vals = [$vals];
        }
        $vals = array_values(array_filter(array_map(static function ($v) {
            return is_string($v) ? trim($v) : $v;
        }, $vals), static fn ($v) => $v !== null && $v !== ''));

        if (count($vals) === 0 && $ff->book_column) {
            $raw = $book->{$ff->book_column} ?? null;
            if ($raw !== null && $raw !== '') {
                if ($mf->repeatable && is_string($raw) && str_contains($raw, ';')) {
                    $vals = array_values(array_filter(array_map('trim', explode(';', $raw))));
                } else {
                    $vals = [(string) $raw];
                }
            }
        }

        if (count($vals) === 0) {
            return null;
        }

        $formatted = array_map(fn ($v) => $this->formatRawValue($v, $mf, $ff->book_column), $vals);

        return implode('; ', array_filter($formatted, static fn ($v) => $v !== ''));
    }

    protected function formatBookColumnValue(LibraryBook $book, string $column): ?string
    {
        $raw = $book->getAttribute($column);
        if ($raw === null || $raw === '') {
            return null;
        }

        if ($column === 'curriculum') {
            return config('catalog.curriculum_options')[(string) $raw] ?? (string) $raw;
        }

        if ($raw instanceof \DateTimeInterface) {
            return $raw->format('Y-m-d');
        }

        return (string) $raw;
    }

    protected function formatRawValue(mixed $raw, $mf, ?string $bookColumn): string
    {
        if ($raw instanceof \DateTimeInterface) {
            return $mf->input_type === 'datetime' || $bookColumn === 'date_time_stamp'
                ? $raw->format('Y-m-d H:i')
                : $raw->format('Y-m-d');
        }

        $str = (string) $raw;

        if (($mf->input_type === 'datetime' || $bookColumn === 'date_time_stamp') && filled($str)) {
            try {
                return Carbon::parse($str)->format('Y-m-d H:i');
            } catch (\Throwable $e) {
                // keep original string
            }
        }

        if ($bookColumn === 'curriculum') {
            return config('catalog.curriculum_options')[$str] ?? $str;
        }

        if ($mf->input_type === 'select' && is_array($mf->options)) {
            foreach ($mf->options as $opt) {
                $optVal = is_array($opt) ? ($opt['value'] ?? '') : $opt;
                $optLabel = is_array($opt) ? ($opt['label'] ?? $optVal) : $opt;
                if ((string) $optVal === $str) {
                    return (string) $optLabel;
                }
            }
        }

        return $str;
    }

    /**
     * @param  Collection<int, Book>  $books
     */
    protected function booksShareSameAttribute(Collection $books, string $attribute): bool
    {
        if ($books->isEmpty()) {
            return false;
        }

        $normalize = static function ($value): string {
            if ($value === null) {
                return "\0null";
            }
            if ($value === '') {
                return "\0empty";
            }
            if ($value instanceof \DateTimeInterface) {
                return $value->format('c');
            }
            if (is_bool($value)) {
                return $value ? '1' : '0';
            }

            return (string) $value;
        };

        $firstVal = $normalize($books->first()->getAttribute($attribute));

        foreach ($books as $b) {
            if ($normalize($b->getAttribute($attribute)) !== $firstVal) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  Collection<int, Book>  $books
     */
    protected function booksShareSameMarcSubfield(Collection $books, string $tag, ?string $subfield): bool
    {
        $books->loadMissing('marcFields');

        $normalize = static function (LibraryBook $book) use ($tag, $subfield): string {
            $values = $book->marcFields
                ->where('tag', $tag)
                ->filter(function ($row) use ($subfield) {
                    if ($subfield === null) {
                        return $row->subfield === null;
                    }

                    return $row->subfield === $subfield;
                })
                ->sortBy('occurrence')
                ->pluck('value')
                ->map(static fn ($v) => trim((string) $v))
                ->filter()
                ->values()
                ->all();

            return json_encode($values);
        };

        $first = $normalize($books->first());
        foreach ($books as $b) {
            if ($normalize($b) !== $first) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  Collection<int, Book>  $books
     */
    protected function opacProgramsShareSame(Collection $books): bool
    {
        $books->loadMissing('library_programs');

        $normalize = static function (LibraryBook $b): string {
            return $b->programs->pluck('id')->sort()->values()->implode(',');
        };

        $first = $normalize($books->first());
        foreach ($books as $b) {
            if ($normalize($b) !== $first) {
                return false;
            }
        }

        return true;
    }
}
