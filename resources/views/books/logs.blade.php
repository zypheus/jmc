@extends('layouts.sec')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/books/logs.css') }}">
<link rel="stylesheet" href="{{ asset('css/admin/circulation.css') }}">
@endsection

@section('content')
@php
    $hasFilters = request()->filled('student_id')
        || request()->filled('employee_id')
        || request()->filled('filter_patron')
        || request()->filled('book_title')
        || request()->filled('start_date')
        || request()->filled('end_date')
        || request()->filled('circulation_type')
        || request()->filled('page');
    $defaultLogsTab = $hasFilters ? 'history' : 'record';
    $defaultCirculationStatus = ($prefillCopyReserved ?? false)
        ? 'room_use'
        : (($prefillReservationStudentId ?? null) ? 'checked_out' : request('status', 'checked_out'));
@endphp

<div class="circulation-page circ-admin">

    <header class="circulation-page__hero">
        <div>
            <p class="circulation-page__eyebrow">Circulation</p>
            <h1 class="circulation-page__title">Book transactions</h1>
            <p class="circulation-page__lead">Check books in or out, then search and review the transaction history.</p>
        </div>
        <a href="{{ route('library.book.index') }}" class="btn btn-outline-secondary btn-sm">← Catalog</a>
    </header>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif
    @if(session('error'))
        <div class="alert alert-danger">{{ session('error') }}</div>
    @endif
    @error('student_id')
        <div class="alert alert-danger">{{ $message }}</div>
    @enderror
    @error('employee_id')
        <div class="alert alert-danger">{{ $message }}</div>
    @enderror

    <ul class="nav nav-pills circulation-pills flex-wrap mb-3" id="logsTabs" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link {{ $defaultLogsTab === 'record' ? 'active' : '' }}" id="logs-record-tab"
                    data-bs-toggle="tab" data-bs-target="#logsTabRecord" type="button" role="tab"
                    aria-controls="logsTabRecord" aria-selected="{{ $defaultLogsTab === 'record' ? 'true' : 'false' }}">
                Record transaction
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link {{ $defaultLogsTab === 'history' ? 'active' : '' }}" id="logs-history-tab"
                    data-bs-toggle="tab" data-bs-target="#logsTabHistory" type="button" role="tab"
                    aria-controls="logsTabHistory" aria-selected="{{ $defaultLogsTab === 'history' ? 'true' : 'false' }}">
                Transaction logs
                @if($hasFilters)
                    <span class="badge text-bg-light text-dark ms-1">{{ $logs->total() }}</span>
                @endif
            </button>
        </li>
    </ul>

    <div class="circulation-tab-shell">
        <div class="tab-content" id="logsTabsContent">
            <div class="tab-pane fade {{ $defaultLogsTab === 'record' ? 'show active' : '' }}" id="logsTabRecord"
                 role="tabpanel" aria-labelledby="logs-record-tab" tabindex="0">
                <p class="circulation-tab-intro">Scan or type a copy ID, select a patron, then record check out, room use, or check in.</p>
                <section class="circulation-card">
                    <div class="circulation-card__head">
                        <h2 class="circulation-card__title">New transaction</h2>
                        <p class="circulation-card__hint text-muted mb-0">
                            Copy <strong>accession number</strong> (recommended), barcode, or RFID — then patron and circulation type.
                        </p>
                    </div>
                    <form action="{{ route('library.logs.store') }}" method="POST" id="logTransactionForm" class="circulation-card__body circ-desk-form">
                        @csrf
                        <input type="hidden" name="due_date" id="loan_due_date" value="">
                        <input type="hidden" name="loan_duration_days" id="loan_duration_days" value="">

                        <div class="row g-2 circ-desk-form-row">
                            <div class="col-lg-4">
                                <div class="circ-form-section circ-form-section--general h-100">
                                    <div class="circ-section-heading">
                                        <span class="circ-section-badge circ-section-badge--general">Item</span>
                                        <h6 class="circ-section-title">Copy ID</h6>
                                    </div>
                                    <div class="circ-form-field">
                                        <label for="copy_identifier_input" class="form-label">Accession, barcode, or RFID</label>
                                        <div class="circulation-autocomplete-wrap">
                                            <input type="text" class="form-control circulation-input" name="copy_identifier" id="copy_identifier_input"
                                                   value="{{ $prefillCopyIdentifier ?? request('copy_identifier', request('rfid')) }}"
                                                   placeholder="Scan or type…" autocomplete="off" required>
                                            <ul id="bookSuggestions" class="circulation-suggest list-group"></ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <div class="circ-form-section circ-form-section--student h-100">
                                    <div class="circ-section-heading">
                                        <span class="circ-section-badge circ-section-badge--student">Patron</span>
                                        <h6 class="circ-section-title">Who is borrowing?</h6>
                                    </div>
                                    <div class="circ-form-field">
                                        <label for="patron_name" class="form-label">Name or ID</label>
                                        <input type="hidden" name="student_id" id="student_id" value="{{ request('student_id', $prefillReservationStudentId ?? '') }}">
                                        <input type="hidden" name="employee_id" id="employee_id" value="{{ request('employee_id') }}">
                                        <div class="circulation-autocomplete-wrap">
                                            <input type="text" id="patron_name" class="form-control circulation-input" autocomplete="off"
                                                   placeholder="Search patron…" value="{{ $prefillPatronLabel ?? '' }}">
                                            <ul id="patronSuggestions" class="circulation-suggest list-group"></ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <div class="circ-form-section circ-form-section--renewal h-100">
                                    <div class="circ-section-heading">
                                        <span class="circ-section-badge circ-section-badge--renewal">Action</span>
                                        <h6 class="circ-section-title">Circulation type</h6>
                                    </div>
                                    <div class="circ-form-field">
                                        <label for="status_select" class="form-label">Type</label>
                                        <select name="status" id="status_select" class="form-select circulation-input" required>
                                            <option value="checked_out" id="status_option_checked_out"
                                                {{ $defaultCirculationStatus === 'checked_out' ? 'selected' : '' }}>
                                                Check out (outside library)
                                            </option>
                                            <option value="room_use" {{ $defaultCirculationStatus === 'room_use' ? 'selected' : '' }}>
                                                Room use (in library)
                                            </option>
                                            <option value="checked_in" {{ $defaultCirculationStatus === 'checked_in' ? 'selected' : '' }}>
                                                Check in
                                            </option>
                                        </select>
                                        <p class="form-text mb-0 mt-1 d-none" id="reserved_copy_notice">
                                            This copy is <strong>Reserved</strong> — room use only.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="circ-desk-action-bar">
                            <p class="circ-desk-action-bar__hint mb-0">Loan terms confirmed at checkout.</p>
                            <button type="submit" class="btn btn-primary btn-sm" id="record">Record transaction</button>
                        </div>
                    </form>
                </section>
            </div>

            <div class="tab-pane fade {{ $defaultLogsTab === 'history' ? 'show active' : '' }}" id="logsTabHistory"
                 role="tabpanel" aria-labelledby="logs-history-tab" tabindex="0">
                <p class="circulation-tab-intro">Search and review circulation history. Apply filters, renew loans, or export a report.</p>
                <section class="circulation-card">
                    <div class="circulation-card__head">
                        <h2 class="circulation-card__title">Search &amp; history</h2>
                        <p class="circulation-card__hint text-muted mb-0">Search by patron or book title; narrow by date and loan type.</p>
                    </div>
                    <form method="GET" action="{{ route('library.logs.index') }}" id="logFilterForm" class="circulation-card__body circ-desk-form">
                        <div class="circ-form-section circ-form-section--search">
                            <div class="circ-section-heading">
                                <span class="circ-section-badge circ-section-badge--search">Search</span>
                                <h6 class="circ-section-title">Patron &amp; title</h6>
                            </div>
                            <div class="row g-2">
                                <div class="col-md-6">
                                    <div class="circ-form-field">
                                        <label for="filter_patron" class="form-label">Patron</label>
                                        <input type="hidden" name="student_id" id="filter_student_id" value="{{ request('student_id') }}">
                                        <input type="hidden" name="employee_id" id="filter_employee_id" value="{{ request('employee_id') }}">
                                        <div class="circulation-autocomplete-wrap">
                                            <input type="text" name="filter_patron" id="filter_patron" class="form-control circulation-input"
                                                   value="{{ $prefillPatronLabel ?? '' }}" autocomplete="off"
                                                   placeholder="Search patron name or ID…">
                                            <ul id="filterPatronSuggestions" class="circulation-suggest list-group"></ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="circ-form-field">
                                        <label for="filter_book_title" class="form-label">Book title</label>
                                        <div class="circulation-autocomplete-wrap">
                                            <input type="text" name="book_title" id="filter_book_title" class="form-control circulation-input"
                                                   value="{{ $filterBookTitle ?? '' }}" autocomplete="off"
                                                   placeholder="Search book title…">
                                            <ul id="filterBookTitleSuggestions" class="circulation-suggest list-group"></ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="circ-form-section circ-form-section--general">
                            <div class="circ-section-heading">
                                <span class="circ-section-badge circ-section-badge--general">Range</span>
                                <h6 class="circ-section-title">Date &amp; loan type</h6>
                            </div>
                            <div class="row g-2">
                                <div class="col-md-4">
                                    <div class="circ-form-field">
                                        <label for="start_date" class="form-label">From</label>
                                        <input type="date" class="form-control circulation-input" name="start_date" id="start_date"
                                               value="{{ request('start_date') }}">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="circ-form-field">
                                        <label for="end_date" class="form-label">To</label>
                                        <input type="date" class="form-control circulation-input" name="end_date" id="end_date"
                                               value="{{ request('end_date') }}">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="circ-form-field">
                                        <label for="circulation_type" class="form-label">Loan type</label>
                                        <select class="form-select circulation-input" name="circulation_type" id="circulation_type">
                                            <option value="">All types</option>
                                            <option value="checkout" {{ request('circulation_type') === 'checkout' ? 'selected' : '' }}>Check out</option>
                                            <option value="room_use" {{ request('circulation_type') === 'room_use' ? 'selected' : '' }}>Room use</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="circ-desk-action-bar circ-desk-action-bar--filter">
                            <p class="circ-desk-action-bar__hint mb-0">
                                @if($hasFilters)
                                    <strong>{{ $logs->total() }}</strong> {{ $logs->total() === 1 ? 'match' : 'matches' }}
                                @else
                                    Latest transactions
                                @endif
                            </p>
                            <div class="d-flex flex-wrap gap-2">
                                <button type="submit" class="btn btn-primary btn-sm" id="apply">Apply filters</button>
                                <a href="{{ route('library.logs.index') }}" class="btn btn-outline-secondary btn-sm">Reset</a>
                            </div>
                        </div>
                    </form>

        <div class="circulation-table-wrap">
            <table class="table table-hover circulation-table mb-0">
                <thead>
                    <tr>
                        <th>Book</th>
                        <th>Copy ID</th>
                        <th>Patron</th>
                        <th>Status</th>
                        <th>Loan type</th>
                        <th>When</th>
                        <th>Due</th>
                        <th>Renewals</th>
                        <th>Returned</th>
                        <th>Overdue</th>
                        <th>Days late</th>
                        <th>Fine</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($logs as $log)
                    @php
                        $isCheckIn = $log->status === 'Checked In';
                        $daysLate = 0;
                        $isOverdue = false;
                        $tooltip = '';
                        $effectiveLate = 0;

                        if ($isCheckIn && $log->due_date && $log->returned_date) {
                            $daysLate = max(0, $log->due_date->diffInDays($log->returned_date, false));
                            $daysLateWhole = floor($daysLate);
                            $settings = \App\Models\FineSetting::latest('created_at')->first();
                            $patronTerms = $settings
                                ? $settings->patronTerms((bool) $log->employee_id)
                                : (object) ['grace_period_days' => 0, 'fine_per_day' => 0];
                            $gracePeriod = $patronTerms->grace_period_days ?? 0;
                            $finePerDay = $patronTerms->fine_per_day ?? 0;
                            $effectiveLate = max(0, $daysLateWhole - $gracePeriod);
                            $isOverdue = $effectiveLate > 0;
                            if ($isOverdue) {
                                $tooltip = "{$effectiveLate} day(s) × ₱".number_format($finePerDay, 2)." = ₱".number_format($log->fine_incurred, 2);
                            }
                        }
                    @endphp
                    <tr>
                        <td class="circulation-table__title">{{ $log->book->title_statement ?? 'N/A' }}</td>
                        <td class="small">
                            @if($log->book)
                                <code>{{ $log->book->copyIdentifierForCirculation() ?? '—' }}</code>
                                @if($log->book->copyIdentifierTypeLabel())
                                    <span class="text-muted d-block">{{ $log->book->copyIdentifierTypeLabel() }}</span>
                                @endif
                            @else
                                —
                            @endif
                        </td>
                        <td>{{ $log->patronLabel() }}</td>
                        <td>
                            @if($log->status === 'Checked Out')
                                <span class="badge text-bg-warning">Out</span>
                            @else
                                <span class="badge text-bg-success">In</span>
                            @endif
                        </td>
                        <td>{{ $log->circulationLabel() }}</td>
                        <td class="text-nowrap small">{{ $log->timestamp_manila ?? '—' }}</td>
                        <td class="text-nowrap small">{{ $log->due_date ?? '—' }}</td>
                        <td class="small">
                            @if(($log->circulation_type ?? \App\Models\BookLog::CIRCULATION_CHECKOUT) === \App\Models\BookLog::CIRCULATION_CHECKOUT)
                                {{ (int) ($log->renew_count ?? 0) }}/{{ \App\Models\Setting::maxRenewalsPerLoan() }}
                            @else
                                —
                            @endif
                        </td>
                        <td class="text-nowrap small">{{ $log->returned_date ?? '—' }}</td>
                        <td>
                            @if($isCheckIn)
                                @if($isOverdue)
                                    <span class="badge text-bg-danger">Overdue</span>
                                @else
                                    <span class="badge text-bg-success">On time</span>
                                @endif
                            @else
                                —
                            @endif
                        </td>
                        <td>{{ $isCheckIn && $isOverdue ? $effectiveLate : '—' }}</td>
                        <td class="text-nowrap">
                            @if($isCheckIn && $isOverdue)
                                <span data-bs-toggle="tooltip" title="{{ $tooltip }}">₱{{ number_format($log->fine_incurred, 2) }}</span>
                            @else
                                —
                            @endif
                        </td>
                        <td class="text-nowrap">
                            @if($log->status === 'Checked Out'
                                && (($log->circulation_type ?? \App\Models\BookLog::CIRCULATION_CHECKOUT) === \App\Models\BookLog::CIRCULATION_CHECKOUT)
                                && $log->due_date
                                && (int) ($log->renew_count ?? 0) < \App\Models\Setting::maxRenewalsPerLoan()
                                && ! \App\Models\BookReservation::blocksRenewal((int) $log->book_id))
                                <form method="POST" action="{{ route('library.logs.renew', $log->book_id) }}" class="d-inline">
                                    @csrf
                                    <input type="hidden" name="student_id" value="{{ $log->student_id }}">
                                    <button type="submit" class="btn btn-sm btn-outline-primary"
                                        onclick="return confirm('Renew this loan and extend the due date?');">Renew</button>
                                </form>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="13" class="text-center text-muted py-5">No transactions match your filters.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 border-top">
            @include('layouts.partials.pagination_bar', ['paginator' => $logs])
            <a href="{{ route('library.transactions.export') }}" class="btn btn-outline-secondary btn-sm">Download report</a>
        </div>
                </section>
            </div>
        </div>
    </div>
</div>

@if(session('overdue_modal'))
<div class="modal fade" id="overdueModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content border-danger">
            <div class="modal-header bg-danger text-white">
                <h5 class="modal-title">Overdue book notice</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p><strong>Book:</strong> {{ session('overdue_modal.book_title') }}</p>
                <p><strong>Patron:</strong> {{ session('overdue_modal.patron_name') }}</p>
                <p><strong>Days late:</strong> {{ session('overdue_modal.days_late') }}</p>
                <p><strong>Fine:</strong> ₱{{ number_format(session('overdue_modal.fine'), 2) }}</p>
                <p class="text-muted mb-0"><em>{{ session('overdue_modal.breakdown') }}</em></p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">OK</button>
            </div>
        </div>
    </div>
</div>
@endif

@include('partials.loan_terms_modal', [
    'loanDefaultDaysStudent' => $loanDefaultDaysStudent ?? 7,
    'loanDefaultDaysEmployee' => $loanDefaultDaysEmployee ?? 7,
])

@endsection

@section('scripts')
<script>
    window.LOAN_DEFAULT_DAYS_STUDENT = @json($loanDefaultDaysStudent ?? 7);
    window.LOAN_DEFAULT_DAYS_EMPLOYEE = @json($loanDefaultDaysEmployee ?? 7);
    window.PREFILL_COPY_RESERVED = @json($prefillCopyReserved ?? false);
</script>
<script src="{{ asset('js/loan-terms.js') }}"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    const patronSuggestUrl = @json(route('library.patron.suggestions'));
    const bookSuggestUrl = @json(route('library.book.suggestions'));
    @php
        $bookTitleLogSuggestUrl = \Illuminate\Support\Facades\Route::has('book.title.log.suggestions')
            ? route('library.book.title.log.suggestions')
            : url('/book-title-log-suggestions');
    @endphp
    const bookTitleLogSuggestUrl = @json($bookTitleLogSuggestUrl);

    function wireAutocomplete({ input, list, fetchUrl, onSelect, minChars = 1, mapItems }) {
        if (!input || !list) return;

        let debounce = null;

        function hide() {
            list.innerHTML = '';
            list.classList.remove('is-open');
        }

        function showItems(items) {
            list.innerHTML = '';
            if (!items.length) {
                hide();
                return;
            }
            items.forEach(function (item) {
                const li = document.createElement('li');
                li.className = 'list-group-item list-group-item-action';
                li.textContent = item.label;
                li.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    onSelect(item, input, list);
                    hide();
                });
                list.appendChild(li);
            });
            list.classList.add('is-open');
        }

        input.addEventListener('input', function () {
            const query = this.value.trim();
            clearTimeout(debounce);
            if (query.length < minChars) {
                hide();
                return;
            }
            debounce = setTimeout(function () {
                fetch(fetchUrl + '?query=' + encodeURIComponent(query), {
                    headers: { 'Accept': 'application/json' },
                })
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        const items = mapItems(data);
                        showItems(items);
                    })
                    .catch(function () { hide(); });
            }, 200);
        });

        input.addEventListener('blur', function () {
            setTimeout(hide, 150);
        });

        document.addEventListener('click', function (e) {
            if (!list.contains(e.target) && e.target !== input) {
                hide();
            }
        });

        return { hide };
    }

    // Record form — patron
    const studentIdInput = document.getElementById('student_id');
    const employeeIdInput = document.getElementById('employee_id');
    const logForm = document.getElementById('logTransactionForm');

    function applyPatronSelection(patron) {
        if (!patron) return;
        const isEmployee = patron.type === 'employee';
        if (studentIdInput) studentIdInput.value = isEmployee ? '' : (patron.id || '');
        if (employeeIdInput) employeeIdInput.value = isEmployee ? (patron.id || '') : '';
    }

    function clearPatronSelection() {
        if (studentIdInput) studentIdInput.value = '';
        if (employeeIdInput) employeeIdInput.value = '';
    }

    function getLoanDefaultDaysForSelectedPatron() {
        const hasEmployee = employeeIdInput && String(employeeIdInput.value || '').trim();
        if (hasEmployee) {
            return window.LOAN_DEFAULT_DAYS_EMPLOYEE || 7;
        }
        return window.LOAN_DEFAULT_DAYS_STUDENT || 7;
    }

    let loanTermsConfirmed = false;

    if (logForm) {
        logForm.addEventListener('submit', function (e) {
            const hasStudent = studentIdInput && String(studentIdInput.value || '').trim();
            const hasEmployee = employeeIdInput && String(employeeIdInput.value || '').trim();
            if (!hasStudent && !hasEmployee) {
                e.preventDefault();
                alert('Select a patron from the suggestions list.');
                return;
            }

            const status = document.getElementById('status_select')?.value;
            if (status === 'checked_out' && !loanTermsConfirmed) {
                e.preventDefault();
                if (typeof promptLoanTerms !== 'function') {
                    logForm.submit();
                    return;
                }
                promptLoanTerms(getLoanDefaultDaysForSelectedPatron()).then(function (terms) {
                    const dueField = document.getElementById('loan_due_date');
                    const daysField = document.getElementById('loan_duration_days');
                    if (dueField) dueField.value = terms.due_date || '';
                    if (daysField) daysField.value = terms.loan_duration_days || '';
                    loanTermsConfirmed = true;
                    if (typeof logForm.requestSubmit === 'function') {
                        logForm.requestSubmit();
                    } else {
                        logForm.submit();
                    }
                });
                return;
            }

            loanTermsConfirmed = false;
        });
    }

    wireAutocomplete({
        input: document.getElementById('patron_name'),
        list: document.getElementById('patronSuggestions'),
        fetchUrl: patronSuggestUrl,
        onSelect: function (item) {
            document.getElementById('patron_name').value = item.raw.name;
            applyPatronSelection(item.raw);
        },
        mapItems: function (data) {
            return (data || []).map(function (p) {
                return { label: p.name, raw: p };
            });
        },
    });

    document.getElementById('patron_name')?.addEventListener('input', clearPatronSelection);

    const statusSelect = document.getElementById('status_select');
    const checkoutOption = document.getElementById('status_option_checked_out');
    const reservedNotice = document.getElementById('reserved_copy_notice');

    function applyReservedCirculationRules(isReserved) {
        if (!statusSelect) {
            return;
        }
        if (checkoutOption) {
            checkoutOption.disabled = !!isReserved;
        }
        if (reservedNotice) {
            reservedNotice.classList.toggle('d-none', !isReserved);
        }
        if (isReserved && statusSelect.value === 'checked_out') {
            statusSelect.value = 'room_use';
        }
    }

    function applyPatronHoldFromBook(b) {
        if (!b.patron_hold || !b.reservation_student_id) {
            return false;
        }
        if ((b.availability || '') === 'Borrowed') {
            return false;
        }
        const patronInput = document.getElementById('patron_name');
        if (patronInput) {
            patronInput.value = b.reservation_student_name || '';
        }
        applyPatronSelection({
            type: 'student',
            id: b.reservation_student_id,
        });
        if (statusSelect) {
            statusSelect.value = 'checked_out';
        }
        return true;
    }

    applyReservedCirculationRules(window.PREFILL_COPY_RESERVED);

    // Record form — copy ID (accession / barcode / RFID)
    wireAutocomplete({
        input: document.getElementById('copy_identifier_input'),
        list: document.getElementById('bookSuggestions'),
        fetchUrl: bookSuggestUrl,
        onSelect: function (item) {
            const copyInput = document.getElementById('copy_identifier_input');
            const b = item.raw;
            copyInput.value = b.copy_identifier || b.accession_no || b.barcode || b.rfid || '';
            applyCopySelectionFromLookup(b);
        },
        mapItems: function (data) {
            return (data || []).map(function (b) {
                const idPart = b.copy_identifier_summary || 'No copy ID';
                const reservedTag = b.reserved ? ' · Room use' : '';
                const holdTag = b.patron_hold ? ' · Patron reserved' : '';
                const label = (b.title || 'Untitled') + ' — ' + (b.author || '') + ' · ' + idPart + reservedTag + holdTag;
                return { label: label, raw: b };
            });
        },
    });

    document.getElementById('copy_identifier_input')?.addEventListener('input', function () {
        applyReservedCirculationRules(false);
    });

    function applyCopySelectionFromLookup(b) {
        if (!b) return;
        applyReservedCirculationRules(!!b.reserved);
        const patronInput = document.getElementById('patron_name');
        if ((b.availability || '') === 'Borrowed') {
            if (statusSelect) statusSelect.value = 'checked_in';
            if (patronInput) patronInput.value = b.last_patron || '';
            applyPatronSelection({
                type: b.last_employee_id ? 'employee' : 'student',
                id: b.last_employee_id || b.last_student_id || '',
            });
        } else if (applyPatronHoldFromBook(b)) {
            // Patron filled from patron reservation
        } else {
            if (statusSelect) {
                statusSelect.value = b.reserved ? 'room_use' : 'checked_out';
            }
            clearPatronSelection();
        }
    }

    let copyLookupTimer = null;
    document.getElementById('copy_identifier_input')?.addEventListener('blur', function () {
        const code = this.value.trim();
        if (code.length < 1) return;
        clearTimeout(copyLookupTimer);
        copyLookupTimer = setTimeout(function () {
            fetch(bookSuggestUrl + '?query=' + encodeURIComponent(code), {
                headers: { Accept: 'application/json' },
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    const normalized = code.toLowerCase();
                    const match = (data || []).find(function (b) {
                        return [b.copy_identifier, b.accession_no, b.barcode, b.rfid]
                            .filter(Boolean)
                            .some(function (v) { return String(v).trim().toLowerCase() === normalized; });
                    });
                    if (match) {
                        applyCopySelectionFromLookup(match);
                    }
                })
                .catch(function () {});
        }, 200);
    });

    // Filter — patron
    const filterStudentId = document.getElementById('filter_student_id');
    const filterEmployeeId = document.getElementById('filter_employee_id');
    wireAutocomplete({
        input: document.getElementById('filter_patron'),
        list: document.getElementById('filterPatronSuggestions'),
        fetchUrl: patronSuggestUrl,
        onSelect: function (item) {
            document.getElementById('filter_patron').value = item.raw.name;
            const isEmployee = item.raw.type === 'employee';
            if (filterStudentId) filterStudentId.value = isEmployee ? '' : item.raw.id;
            if (filterEmployeeId) filterEmployeeId.value = isEmployee ? item.raw.id : '';
        },
        mapItems: function (data) {
            return (data || []).map(function (p) {
                return { label: p.name, raw: p };
            });
        },
    });

    document.getElementById('filter_patron')?.addEventListener('input', function () {
        if (filterStudentId) filterStudentId.value = '';
        if (filterEmployeeId) filterEmployeeId.value = '';
    });

    // Filter — book title
    wireAutocomplete({
        input: document.getElementById('filter_book_title'),
        list: document.getElementById('filterBookTitleSuggestions'),
        fetchUrl: bookTitleLogSuggestUrl,
        onSelect: function (item) {
            document.getElementById('filter_book_title').value = item.raw.title;
        },
        mapItems: function (data) {
            return (data || []).map(function (row) {
                return { label: row.title, raw: row };
            });
        },
    });

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
        new bootstrap.Tooltip(el);
    });

    const overdueModal = document.getElementById('overdueModal');
    if (overdueModal) {
        bootstrap.Modal.getOrCreateInstance(overdueModal).show();
    }

    const logsTabButtons = document.querySelectorAll('#logsTabs button[data-bs-toggle="tab"]');
    logsTabButtons.forEach(function (button) {
        button.addEventListener('shown.bs.tab', function (event) {
            const paneId = event.target.getAttribute('data-bs-target').replace('#', '');
            history.replaceState(null, '', '#' + paneId);
        });
    });

    const hash = window.location.hash.replace('#', '');
    if (hash === 'logsTabRecord' || hash === 'logsTabHistory') {
        const tab = document.querySelector('#logsTabs button[data-bs-target="#' + hash + '"]');
        if (tab && window.bootstrap) {
            bootstrap.Tab.getOrCreateInstance(tab).show();
        }
    }
});
</script>
@endsection
