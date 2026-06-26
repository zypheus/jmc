@php
    $curriculumValue = old('curriculum', $curriculumValue ?? '');
    $curriculumOptions = config('catalog.curriculum_options', []);
@endphp
<div class="col-12">
    <label for="curriculum" class="form-label catalog-field-label">
        <span class="catalog-field-name">Curriculum</span>
    </label>
    <select name="curriculum" id="curriculum" class="form-control">
        <option value="">— Select curriculum —</option>
        @foreach($curriculumOptions as $value => $label)
            <option value="{{ $value }}" {{ (string) $curriculumValue === (string) $value ? 'selected' : '' }}>
                {{ $label }}
            </option>
        @endforeach
    </select>
    <p class="form-text text-muted mb-0">Collection area: Prof Ed, Gen Ed, Filipiniana, or General Reference.</p>
</div>
