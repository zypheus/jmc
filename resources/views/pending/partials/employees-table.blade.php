<div class="data-panel-table-wrap">
    @if($pendingEmployees->total() > 0)
        <div class="patron-dir__card">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Applicant</th>
                            <th>Designation</th>
                            <th>Program</th>
                            <th>Start year</th>
                            <th>Submitted</th>
                            <th class="text-end">Decision</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($pendingEmployees as $e)
                            @php
                                $programLabel = $programs->firstWhere('program_code', $e->program)?->program_name
                                    ?? $e->program
                                    ?? $e->department;
                            @endphp
                            <tr>
                                <td>
                                    <div class="patron-dir__person">
                                        @if($e->formal_picture)
                                            <img src="{{ asset($e->formal_picture) }}" alt="" class="patron-dir__avatar" loading="lazy" width="48" height="48">
                                        @else
                                            <span class="patron-dir__avatar patron-dir__avatar--empty">N/A</span>
                                        @endif
                                        <div>
                                            <div class="patron-dir__person-name">
                                                {{ $e->lastname }}, {{ $e->firstname }}
                                                @if($e->middle_initial) {{ $e->middle_initial }}. @endif
                                            </div>
                                            <div class="patron-dir__person-meta">{{ $e->employee_id }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{{ $e->designation ?? $e->position ?? '—' }}</td>
                                <td><span class="patron-dir__chip">{{ $programLabel ?: '—' }}</span></td>
                                <td><span class="patron-dir__chip patron-dir__chip--muted">{{ $e->year_start_work ?? '—' }}</span></td>
                                <td class="text-muted small">{{ $e->created_at?->timezone('Asia/Manila')->diffForHumans() }}</td>
                                <td class="text-end">
                                    @include('patrons.partials.pending_decision_buttons', [
                                        'approveRoute' => route('library.employees.approve', $e->id),
                                        'rejectRoute' => route('library.employees.reject', $e->id),
                                    ])
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @include('layouts.partials.pagination_bar', ['paginator' => $pendingEmployees])
        </div>
    @else
        <div class="patron-dir__card">
            <div class="patron-dir__empty">
                <div class="patron-dir__empty-icon">✓</div>
                <p class="mb-0">No pending faculty &amp; staff registrations{{ ($search ?? '') !== '' ? ' match your search' : '' }}.</p>
            </div>
        </div>
    @endif
</div>
