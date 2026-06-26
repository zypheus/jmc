<div class="data-panel-table-wrap">
    @if($pendingStudents->total() > 0)
        <div class="patron-dir__card">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Applicant</th>
                            <th>Program</th>
                            <th>Year</th>
                            <th>Submitted</th>
                            <th class="text-end">Decision</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($pendingStudents as $p)
                            @php
                                $programLabel = $programs->firstWhere('program_code', $p->course)?->program_name ?? $p->course;
                            @endphp
                            <tr>
                                <td>
                                    <div class="patron-dir__person">
                                        @if($p->profile_picture)
                                            <img src="{{ asset($p->profile_picture) }}" alt="" class="patron-dir__avatar" loading="lazy" width="48" height="48">
                                        @else
                                            <span class="patron-dir__avatar patron-dir__avatar--empty">N/A</span>
                                        @endif
                                        <div>
                                            <div class="patron-dir__person-name">{{ $p->lastname }}, {{ $p->firstname }}</div>
                                            <div class="patron-dir__person-meta">
                                                @if($p->id_number) ID {{ $p->id_number }} @endif
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td><span class="patron-dir__chip">{{ $programLabel ?: '—' }}</span></td>
                                <td><span class="patron-dir__chip patron-dir__chip--muted">{{ $p->year ?: '—' }}</span></td>
                                <td class="text-muted small">{{ $p->created_at?->timezone('Asia/Manila')->diffForHumans() }}</td>
                                <td class="text-end">
                                    @include('patrons.partials.pending_decision_buttons', [
                                        'approveRoute' => route('library.students.approve', $p->id),
                                        'rejectRoute' => route('library.students.reject', $p->id),
                                    ])
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @include('layouts.partials.pagination_bar', ['paginator' => $pendingStudents])
        </div>
    @else
        <div class="patron-dir__card">
            <div class="patron-dir__empty">
                <div class="patron-dir__empty-icon">✓</div>
                <p class="mb-0">No pending student registrations{{ ($search ?? '') !== '' ? ' match your search' : '' }}.</p>
            </div>
        </div>
    @endif
</div>
