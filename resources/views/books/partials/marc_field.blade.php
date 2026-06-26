@if($ff->marcField)
@php
    $mf = $ff->marcField;
    $tag = $mf->tag;
    $subKey = $mf->subfield ?? '_';
    $display = $tag . ($mf->subfield ? " ‡{$mf->subfield}" : "");
    $values = $marcValues[$tag][$subKey] ?? [];
    if (!is_array($values)) $values = [];
    ksort($values);
    $values = array_values($values);
    if (count($values) === 0) {
        $values = [$ff->default_value ?? ''];
    }

    $pickerTypes = ['date', 'time', 'datetime'];
    $isPickerField = in_array($mf->input_type, $pickerTypes, true);
    $isExtensibleSelect = $mf->input_type === 'select'
        && \App\Models\MarcField::isExtensibleSelect($tag, $mf->subfield);
    $selectOptions = $isExtensibleSelect
        ? $mf->mergedSelectOptions($ff->book_column ?? null)
        : ($mf->options ?? []);
    if ($mf->input_type === 'select') {
        foreach ($values as $existingVal) {
            $v = is_array($existingVal) ? '' : trim((string) $existingVal);
            if ($v === '') {
                continue;
            }
            $has = collect($selectOptions)->contains(fn ($o) => (is_array($o) ? ($o['value'] ?? '') : $o) === $v);
            if (! $has) {
                $selectOptions = array_merge([$v], $selectOptions);
            }
        }
    }
@endphp

<div class="col-md-6 marc-field {{ $isPickerField ? 'marc-field--picker' : '' }}" data-tag="{{ $tag }}" data-sub="{{ $subKey }}" data-repeatable="{{ $mf->repeatable ? '1' : '0' }}" data-input-type="{{ $mf->input_type }}">
    <label class="form-label catalog-field-label">
        <span class="catalog-field-tag">{{ $display }}</span>
        @if($mf->label)
            <span class="catalog-field-name">{{ $mf->label }}</span>
        @endif
        @if($ff->required)
            <span class="text-danger">*</span>
        @endif
    </label>

    <div class="marc-values d-grid gap-2">
        @foreach($values as $idx => $val)
            @php $name = "marc[{$tag}][{$subKey}][]"; @endphp

            @if($mf->input_type === 'textarea')
                <textarea name="{{ $name }}" class="form-control catalog-textarea" rows="2" @if($ff->required) required @endif>{{ old("marc.$tag.$subKey.$idx", $val) }}</textarea>
            @elseif($mf->input_type === 'select')
                <div class="marc-select-wrap">
                    <select name="{{ $name }}" class="form-control marc-select" @if($ff->required) required @endif>
                        <option value="">— Select —</option>
                        @foreach($selectOptions as $opt)
                            @php $optVal = is_array($opt) ? ($opt['value'] ?? '') : $opt; @endphp
                            @php $optLabel = is_array($opt) ? ($opt['label'] ?? $optVal) : $opt; @endphp
                            <option value="{{ $optVal }}" {{ old("marc.$tag.$subKey.$idx", $val) == $optVal ? 'selected' : '' }}>
                                {{ $optLabel }}
                            </option>
                        @endforeach
                    </select>
                    @if($isExtensibleSelect && $loop->first)
                        @can('isAdmin')
                            <p class="form-text text-muted small mb-0 mt-1">
                                <a href="{{ route('library.admin.catalog_select_options.index', ['field' => $tag . ($mf->subfield ?? '')]) }}">Manage {{ strtolower($mf->label ?? 'options') }}</a>
                            </p>
                        @endcan
                    @endif
                </div>
            @elseif($mf->input_type === 'date')
                @php
                    $dateVal = old("marc.$tag.$subKey.$idx", $val);
                    if (filled($dateVal) && ! preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $dateVal)) {
                        try { $dateVal = \Carbon\Carbon::parse($dateVal)->format('Y-m-d'); } catch (\Throwable $e) {}
                    }
                @endphp
                <input type="date" name="{{ $name }}" class="form-control catalog-picker catalog-picker--date"
                       value="{{ $dateVal }}" @if($ff->required) required @endif>
            @elseif($mf->input_type === 'time')
                @php
                    $timeVal = old("marc.$tag.$subKey.$idx", $val);
                    if (filled($timeVal) && ! preg_match('/^\d{2}:\d{2}/', (string) $timeVal)) {
                        try { $timeVal = \Carbon\Carbon::parse($timeVal)->format('H:i'); } catch (\Throwable $e) {}
                    }
                @endphp
                <input type="time" name="{{ $name }}" class="form-control catalog-picker catalog-picker--time"
                       value="{{ $timeVal }}" step="60" @if($ff->required) required @endif>
            @elseif($mf->input_type === 'datetime')
                @php
                    $dtVal = old("marc.$tag.$subKey.$idx", $val);
                    if (filled($dtVal) && ! str_contains((string) $dtVal, 'T')) {
                        try { $dtVal = \Carbon\Carbon::parse($dtVal)->format('Y-m-d\TH:i'); } catch (\Throwable $e) {}
                    }
                    $defaultNow = ($tag === '005' && ($subKey === '_' || $subKey === '') && empty($dtVal) && ! old("marc.$tag.$subKey.$idx"));
                @endphp
                <input type="datetime-local" name="{{ $name }}"
                       class="form-control catalog-picker catalog-picker--datetime"
                       value="{{ $dtVal }}"
                       step="60"
                       @if($defaultNow) data-default-now="1" @endif
                       @if($ff->required) required @endif>
                @if($loop->first)
                    <p class="form-text text-muted small mb-0">Date and time (your device’s local timezone).</p>
                @endif
            @else
                <input type="text" name="{{ $name }}" class="form-control" value="{{ old("marc.$tag.$subKey.$idx", $val) }}" @if($ff->required) required @endif>
            @endif
        @endforeach
    </div>

    @if($mf->repeatable)
        <button type="button" class="btn btn-sm btn-outline-secondary mt-2 marc-add-value">+ Add another</button>
    @endif

    @error("marc.$tag.$subKey")
        <div class="text-danger small mt-1">{{ $message }}</div>
    @enderror
</div>
@endif
