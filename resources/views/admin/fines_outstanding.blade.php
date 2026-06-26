@extends('layouts.sec')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/books/index.css') }}">
<link rel="stylesheet" href="{{ asset('css/admin/circulation.css') }}">
@endsection

@section('content')
<div class="container circ-admin">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h3 class="mb-0">Outstanding fines</h3>
        <div class="d-flex flex-wrap gap-2">
            <a href="{{ route('library.circulation.policy.edit') }}" class="btn btn-outline-secondary btn-sm">Circulation policy</a>
            <a href="{{ route('library.logs.index') }}" class="btn btn-outline-secondary btn-sm">Circulation</a>
        </div>
    </div>

    <p class="text-muted">
        Record when a patron <strong>pays</strong> or you <strong>waive</strong> a fine from a returned book. Original amounts stay in the database for auditing.
    </p>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif
    @if(session('error'))
        <div class="alert alert-danger">{{ session('error') }}</div>
    @endif

    <div class="circ-outstanding-total mb-4">
        <div class="card-body py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span class="fw-semibold">Total still owed (this list / filters)</span>
            <span class="h5 mb-0 text-danger">₱{{ number_format($totalOutstanding, 2) }}</span>
        </div>
    </div>

    <div class="circ-form-section circ-form-section--search mb-4">
        <div class="circ-section-heading">
            <span class="circ-section-badge" style="color:#055160;background:var(--circ-search-bg);border:1px solid var(--circ-search-border);">Search</span>
            <h6 class="circ-section-title">Find outstanding fines</h6>
        </div>
        <form method="GET" action="{{ route('library.fines.outstanding') }}" class="row g-3 align-items-end">
            <div class="col-md-8">
                <div class="circ-form-field mb-0">
                    <label for="fineSearch" class="form-label">Patron, student ID, book title, or barcode</label>
                    <input type="text" name="search" id="fineSearch" class="form-control"
                           placeholder="Search patron, student ID, book title, barcode…"
                           value="{{ request('search') }}">
                </div>
            </div>
            <div class="col-md-4 d-flex gap-2">
                <button type="submit" class="btn btn-primary fw-semibold flex-grow-1">Search</button>
                <a href="{{ route('library.fines.outstanding') }}" class="btn btn-outline-secondary">Reset</a>
            </div>
        </form>
    </div>

    <div class="table-responsive">
        <table class="table table-striped align-middle">
            <thead>
                <tr>
                    <th>Patron</th>
                    <th>Book</th>
                    <th>Returned</th>
                    <th class="text-end">Fine (₱)</th>
                    <th style="min-width: 240px;">Clear fine</th>
                </tr>
            </thead>
            <tbody>
                @forelse($logs as $log)
                <tr>
                    <td>
                        {{ $log->patronLabel() }}
                        @if($log->student?->id_number)
                            <br><small class="text-muted">ID: {{ $log->student->id_number }}</small>
                        @endif
                    </td>
                    <td>
                        {{ $log->book->title_statement ?? '—' }}
                        <br><small class="text-muted">{{ $log->book->barcode ?? '' }}</small>
                    </td>
                    <td>
                        {{ $log->returned_date ? $log->returned_date->timezone('Asia/Manila')->format('M j, Y g:i A') : '—' }}
                    </td>
                    <td class="text-end fw-semibold">₱{{ number_format((float) ($log->fine_balance ?? $log->fine_incurred), 2) }}</td>
                    <td>
                        <form method="POST" action="{{ route('library.fines.logs.clear', $log) }}" class="circ-inline-form d-flex flex-column gap-2">
                            @csrf
                            <div>
                                <label class="form-label">Clearance type</label>
                                <select name="fine_clearance_type" class="form-select form-select-sm" required>
                                    <option value="paid">Paid</option>
                                    <option value="waived">Waived</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Amount (₱)</label>
                                <input type="number" name="fine_clearance_amount" class="form-control form-control-sm"
                                       step="0.01" min="0.01"
                                       max="{{ (float) ($log->fine_balance ?? $log->fine_incurred) }}"
                                       value="{{ number_format((float) ($log->fine_balance ?? $log->fine_incurred), 2, '.', '') }}"
                                       required>
                            </div>
                            <div>
                                <label class="form-label">Note (optional)</label>
                                <input type="text" name="fine_clearance_note" class="form-control form-control-sm" placeholder="Receipt #, note">
                            </div>
                            <button type="submit" class="btn btn-sm btn-success fw-semibold" onclick="return confirm('Apply this clearance amount?');">
                                Confirm clearance
                            </button>
                        </form>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">No outstanding fines. Patrons only see amounts here until you clear them.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="d-flex justify-content-center">
        @include('layouts.partials.pagination_bar', ['paginator' => $logs])
    </div>
</div>
@endsection
