@php
    $columns = $columns ?? 5;
    $rows = $rows ?? 8;
    $headers = $headers ?? [];
    $loadingLabel = $loadingLabel ?? 'Loading…';
    $tableClass = $tableClass ?? 'table table-hover align-middle mb-0';
    $wrapClass = $wrapClass ?? 'data-panel-table-wrap data-panel-table-wrap--loading';
    $skeletonFirstCol = $skeletonFirstCol ?? 'avatar';
@endphp

<div class="{{ $wrapClass }}" aria-busy="true" aria-live="polite">
    <span class="visually-hidden">{{ $loadingLabel }}</span>
    <div class="table-responsive">
        <table class="{{ $tableClass }}">
            @if (count($headers) > 0)
                <thead>
                    <tr>
                        @foreach ($headers as $header)
                            <th scope="col">{{ $header }}</th>
                        @endforeach
                    </tr>
                </thead>
            @endif
            <tbody class="skeleton-table__body">
                @for ($i = 0; $i < $rows; $i++)
                    <tr class="skeleton-table__row">
                        @for ($c = 0; $c < $columns; $c++)
                            <td>
                                @if ($c === 0 && $skeletonFirstCol === 'avatar')
                                    <span class="skeleton-block skeleton-block--avatar placeholder-glow"></span>
                                @elseif ($c === $columns - 1)
                                    <span class="skeleton-block skeleton-block--btn placeholder-glow"></span>
                                @else
                                    <span class="skeleton-block skeleton-block--md placeholder-glow"></span>
                                @endif
                            </td>
                        @endfor
                    </tr>
                @endfor
            </tbody>
        </table>
    </div>
    <div class="pagination-bar d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3 data-panel-pagination skeleton-pagination placeholder-glow" aria-hidden="true">
        <span class="skeleton-block skeleton-block--md"></span>
        <div class="d-flex gap-2">
            <span class="skeleton-block skeleton-block--page"></span>
            <span class="skeleton-block skeleton-block--page skeleton-block--page-active"></span>
            <span class="skeleton-block skeleton-block--page"></span>
        </div>
    </div>
</div>
