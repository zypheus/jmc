<nav class="patron-dir__quick-actions" aria-label="Student queue shortcuts">
    <a href="{{ route('library.pending.index') }}"
       class="patron-dir__quick-action {{ ($pendingRegistrationsCount ?? 0) > 0 ? 'patron-dir__quick-action--attention' : '' }}">
        <span class="patron-dir__quick-action-label">Pending registrations</span>
        @if(($pendingRegistrationsCount ?? 0) > 0)
            <span class="patron-dir__quick-action-count">{{ $pendingRegistrationsCount }}</span>
        @endif
    </a>
    <a href="{{ route('library.students.pending.requests') }}"
       class="patron-dir__quick-action {{ ($pendingEditsCount ?? 0) > 0 ? 'patron-dir__quick-action--attention' : '' }}">
        <span class="patron-dir__quick-action-label">Edit requests</span>
        @if(($pendingEditsCount ?? 0) > 0)
            <span class="patron-dir__quick-action-count">{{ $pendingEditsCount }}</span>
        @endif
    </a>
    <a href="{{ route('library.students.export') }}" class="patron-dir__quick-action">
        <span class="patron-dir__quick-action-label">Export CSV</span>
    </a>
</nav>
