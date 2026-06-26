@php
    $multicopyFormId = $formId ?? 'addBookForm';
    $multicopyEditMode = $editMode ?? false;
    $multicopyToggleId = $multicopyEditMode ? 'add_copies' : 'multiple_copies';
    $multicopySaveOff = $saveLabelOff ?? ($multicopyEditMode ? 'Update book' : 'Save book');
    $multicopySaveOn = $saveLabelOn ?? ($multicopyEditMode ? 'Update & add copies' : 'Save all copies');
    $copyFieldSelectors = collect(config('catalog.copy_unique_marc', []))
        ->map(function ($d) {
            return [
                'tag' => $d['tag'],
                'subfield' => ($d['subfield'] ?? null) === null ? '_' : $d['subfield'],
            ];
        })
        ->values()
        ->all();
@endphp
<script>
document.addEventListener('DOMContentLoaded', () => {
    const editMode = @json($multicopyEditMode);
    const toggle = document.getElementById(@json($multicopyToggleId));
    const panel = document.getElementById('catalogCopiesPanel');
    const marcEditor = document.getElementById('marcEditor');
    const container = document.getElementById('copy-rows-container');
    const addBtn = document.getElementById('add-copy-row-btn');
    const template = document.getElementById('copy-row-template');
    const saveBtn = document.querySelector('#{{ $multicopyFormId }} .btn-save, #{{ $multicopyFormId }} .btn-update');
    if (!toggle || !panel) return;

    const copyFieldSelectors = @json($copyFieldSelectors);
    const saveLabelOff = @json($multicopySaveOff);
    const saveLabelOn = @json($multicopySaveOn);

    function reindexCopyRows() {
        if (!container) return;
        container.querySelectorAll('[data-copy-row]').forEach((row, index) => {
            row.querySelectorAll('input').forEach(input => {
                const field = input.name.includes('[accession_no]') ? 'accession_no' : 'rfid';
                input.name = `copies[${index}][${field}]`;
            });
            const removeBtn = row.querySelector('.remove-copy-row');
            if (removeBtn) {
                const rowCount = container.querySelectorAll('[data-copy-row]').length;
                removeBtn.disabled = editMode ? rowCount <= 0 : rowCount <= 1;
            }
        });
    }

    function ensureAtLeastOneCopyRow() {
        if (!template || !container || !toggle.checked) return;
        if (container.querySelectorAll('[data-copy-row]').length === 0) {
            const html = template.innerHTML.replace(/__INDEX__/g, '0');
            container.insertAdjacentHTML('beforeend', html);
            reindexCopyRows();
        }
    }

    function setMarcCopyFieldsVisible(visible) {
        if (editMode || !marcEditor) return;
        copyFieldSelectors.forEach(def => {
            const sub = def.subfield === null ? '_' : def.subfield;
            marcEditor.querySelectorAll(`.marc-field[data-tag="${def.tag}"][data-sub="${sub}"]`).forEach(el => {
                el.classList.toggle('d-none', !visible);
                el.querySelectorAll('input, textarea, select').forEach(input => {
                    input.disabled = !visible;
                });
            });
        });
    }

    function syncMultiCopyMode() {
        const on = toggle.checked;
        panel.classList.toggle('d-none', !on);
        if (on) {
            ensureAtLeastOneCopyRow();
        }
        panel.querySelectorAll('input, button.remove-copy-row, #add-copy-row-btn').forEach(el => {
            if (el.id === 'add-copy-row-btn') {
                el.disabled = !on;
            } else if (el.matches('input')) {
                el.disabled = !on;
            } else if (el.matches('.remove-copy-row')) {
                const rowCount = container.querySelectorAll('[data-copy-row]').length;
                el.disabled = !on || (editMode ? rowCount <= 0 : rowCount <= 1);
            }
        });
        setMarcCopyFieldsVisible(!on);
        if (saveBtn) {
            saveBtn.textContent = on ? saveLabelOn : saveLabelOff;
        }
    }

    toggle.addEventListener('change', syncMultiCopyMode);
    syncMultiCopyMode();

    addBtn?.addEventListener('click', () => {
        if (!template || !container) return;
        const index = container.querySelectorAll('[data-copy-row]').length;
        const html = template.innerHTML.replace(/__INDEX__/g, String(index));
        container.insertAdjacentHTML('beforeend', html);
        reindexCopyRows();
    });

    container?.addEventListener('click', e => {
        const btn = e.target.closest('.remove-copy-row');
        if (!btn || btn.disabled) return;
        btn.closest('[data-copy-row]')?.remove();
        reindexCopyRows();
    });

    reindexCopyRows();
});
</script>
