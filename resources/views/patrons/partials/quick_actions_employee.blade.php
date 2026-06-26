<nav class="patron-dir__quick-actions" aria-label="Employee queue shortcuts">
    <a href="{{ route('library.pending.index', ['tab' => 'employees']) }}"
       class="patron-dir__quick-action {{ ($pendingRegistrationsCount ?? 0) > 0 ? 'patron-dir__quick-action--attention' : '' }}">
        <span class="patron-dir__quick-action-label">Pending registrations</span>
        @if(($pendingRegistrationsCount ?? 0) > 0)
            <span class="patron-dir__quick-action-count">{{ $pendingRegistrationsCount }}</span>
        @endif
    </a>
    <a href="{{ route('library.register.form') }}" class="patron-dir__quick-action" target="_blank" rel="noopener">
        <span class="patron-dir__quick-action-label">Public registration form ↗</span>
    </a>
</nav>
