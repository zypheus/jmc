@php
    /** @var \Illuminate\Contracts\Pagination\LengthAwarePaginator $paginator */
    $pageResetKeys = array_merge(['page', 'pending_page', 'logs_page', 'students_page', 'employees_page'], $pageResetKeys ?? []);
    $hiddenQuery = collect(request()->query())
        ->except(array_merge(['per_page'], $pageResetKeys, $excludeParams ?? []))
        ->all();
@endphp
<div class="pagination-bar d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
    <form method="GET" action="{{ $formAction ?? request()->url() }}" class="d-flex flex-wrap align-items-center gap-2 per-page-form">
        @foreach($hiddenQuery as $key => $value)
            @if(is_array($value))
                @foreach($value as $item)
                    <input type="hidden" name="{{ $key }}[]" value="{{ $item }}">
                @endforeach
            @else
                <input type="hidden" name="{{ $key }}" value="{{ $value }}">
            @endif
        @endforeach
        <label for="per_page_{{ $paginator->getPageName() }}" class="small text-muted mb-0">Show</label>
        <select
            name="per_page"
            id="per_page_{{ $paginator->getPageName() }}"
            class="form-select form-select-sm"
            style="width: auto; min-width: 4.5rem;"
            onchange="this.form.submit()"
        >
            @foreach(\App\Support\PerPage::options() as $option)
                <option value="{{ $option }}" @selected($paginator->perPage() === $option)>{{ $option }}</option>
            @endforeach
        </select>
        <span class="small text-muted mb-0">results per page</span>
    </form>

    <div class="pagination-bar__links mb-0 data-panel-pagination">
        {{ $paginator->withQueryString()->links('pagination::bootstrap-5') }}
    </div>
</div>
