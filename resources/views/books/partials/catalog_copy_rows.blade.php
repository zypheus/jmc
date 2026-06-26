@php
    $copyPanelMode = $copyPanelMode ?? 'create';
    $copyToggleField = $copyPanelMode === 'edit' ? 'add_copies' : 'multiple_copies';
    $defaultRows = $copyPanelMode === 'edit' ? [] : [['accession_no' => '', 'rfid' => '']];
    $copyRows = old('copies', $defaultRows);
    if (! is_array($copyRows)) {
        $copyRows = [];
    }
    if ($copyPanelMode === 'create' && count($copyRows) === 0) {
        $copyRows = [['accession_no' => '', 'rfid' => '']];
    }
    $marcLabels = collect(config('catalog.copy_unique_marc', []))->keyBy('book_column');
@endphp

<div id="catalogCopiesPanel" class="catalog-copies card border-primary-subtle {{ old($copyToggleField) ? '' : 'd-none' }}">
    <div class="card-body">
        <h3 class="h6 mb-1">{{ $copyPanelMode === 'edit' ? 'Additional copies' : 'Copy identifiers' }}</h3>
        <p class="text-muted small mb-3">
            @if($copyPanelMode === 'edit')
                Add more physical copies of this title. The record above updates this copy; each new row creates another catalog entry with the same bibliographic data.
            @else
                Enter one row per physical copy. Bibliographic data above is shared.
            @endif
            <strong>Accession no.</strong> is the main copy ID for checkout (required for circulation if no barcode/RFID). RFID is optional.
        </p>

        <div id="copy-rows-container" class="catalog-copies__rows">
            @foreach($copyRows as $index => $row)
                <div class="catalog-copies__row row g-2 align-items-end mb-2" data-copy-row>
                    <div class="col-md-5">
                        <label class="form-label catalog-field-label small mb-1">
                            <span class="catalog-field-tag">949</span>
                            <span class="catalog-field-name">{{ $marcLabels['accession_no']['label'] ?? 'Accession no.' }}</span>
                        </label>
                        <input type="text"
                               name="copies[{{ $index }}][accession_no]"
                               class="form-control"
                               value="{{ $row['accession_no'] ?? '' }}"
                               placeholder="Accession no."
                               data-copy-accession>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label catalog-field-label small mb-1">
                            <span class="catalog-field-tag">999 ‡r</span>
                            <span class="catalog-field-name">{{ $marcLabels['rfid']['label'] ?? 'RFID' }}</span>
                        </label>
                        <input type="text"
                               name="copies[{{ $index }}][rfid]"
                               class="form-control"
                               value="{{ $row['rfid'] ?? '' }}"
                               placeholder="RFID tag"
                               data-copy-rfid>
                    </div>
                    <div class="col-md-2 d-flex pb-1">
                        <button type="button" class="btn btn-sm btn-outline-danger w-100 remove-copy-row" title="Remove copy"
                            {{ count($copyRows) <= 1 ? 'disabled' : '' }}>Remove</button>
                    </div>
                </div>
            @endforeach
        </div>

        <button type="button" id="add-copy-row-btn" class="btn btn-sm btn-outline-primary mt-2">
            + Add another copy
        </button>
    </div>
</div>

<template id="copy-row-template">
    <div class="catalog-copies__row row g-2 align-items-end mb-2" data-copy-row>
        <div class="col-md-5">
            <label class="form-label catalog-field-label small mb-1">
                <span class="catalog-field-tag">949</span>
                <span class="catalog-field-name">Accession no.</span>
            </label>
            <input type="text" name="copies[__INDEX__][accession_no]" class="form-control" placeholder="Accession no." data-copy-accession>
        </div>
        <div class="col-md-5">
            <label class="form-label catalog-field-label small mb-1">
                <span class="catalog-field-tag">999 ‡r</span>
                <span class="catalog-field-name">RFID</span>
            </label>
            <input type="text" name="copies[__INDEX__][rfid]" class="form-control" placeholder="RFID tag" data-copy-rfid>
        </div>
        <div class="col-md-2 d-flex pb-1">
            <button type="button" class="btn btn-sm btn-outline-danger w-100 remove-copy-row" title="Remove copy">Remove</button>
        </div>
    </div>
</template>
