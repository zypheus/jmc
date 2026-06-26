@php
    $reservedChecked = filter_var($reservedValue ?? old('reserved'), FILTER_VALIDATE_BOOLEAN);
@endphp
<div class="col-12">
    <div class="catalog-reserved-toggle card border-warning-subtle bg-warning-subtle">
        <div class="card-body py-3">
            <div class="form-check form-switch mb-0">
                <input class="form-check-input" type="checkbox" role="switch" name="reserved" value="1"
                       id="reserved" {{ $reservedChecked ? 'checked' : '' }}>
                <label class="form-check-label fw-semibold" for="reserved">
                    Reserved — room use only
                </label>
            </div>
            <p class="text-muted small mb-0 mt-2">
                When enabled, this copy cannot be checked out for use outside the library. Patrons may only record
                <strong>room use</strong> at the circulation desk.
            </p>
        </div>
    </div>
</div>
