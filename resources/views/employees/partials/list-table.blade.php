<div class="data-panel-table-wrap">
    @if($faculty->total() > 0)
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>Patron</th>
                        <th>Designation</th>
                        <th>Program</th>
                        <th>Start</th>
                        <th class="text-end" style="width: 3rem;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($faculty as $employee)
                        @php
                            $programLabel = $programs->firstWhere('program_code', $employee->program)?->program_name
                                ?? $employee->program
                                ?? $employee->department;
                        @endphp
                        <tr>
                            <td>
                                <div class="patron-dir__person">
                                    @if ($employee->formal_picture)
                                        <img src="{{ asset($employee->formal_picture) }}" alt="" class="patron-dir__avatar" loading="lazy" width="48" height="48">
                                    @else
                                        <span class="patron-dir__avatar patron-dir__avatar--empty">N/A</span>
                                    @endif
                                    <div>
                                        <div class="patron-dir__person-name">
                                            {{ $employee->lastname }}, {{ $employee->firstname }}
                                            @if($employee->middle_initial)
                                                {{ $employee->middle_initial }}.
                                            @endif
                                        </div>
                                        <div class="patron-dir__person-meta">
                                            {{ $employee->employee_id }}
                                            @if($employee->qrcode)
                                                · <span class="patron-dir__code">{{ $employee->qrcode }}</span>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>{{ $employee->designation ?? $employee->position ?? '—' }}</td>
                            <td><span class="patron-dir__chip">{{ $programLabel ?: '—' }}</span></td>
                            <td><span class="patron-dir__chip patron-dir__chip--muted">{{ $employee->year_start_work ?? '—' }}</span></td>
                            <td class="text-end">
                                @include('patrons.partials.row_menu_employee', ['employee' => $employee])
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @include('layouts.partials.pagination_bar', ['paginator' => $faculty])
    @else
        <div class="patron-dir__empty">
            <div class="patron-dir__empty-icon">👥</div>
            <p class="mb-2">No faculty or staff match your filters.</p>
            <a href="{{ route('library.employees.create') }}" class="patron-dir__btn patron-dir__btn--primary">Register first patron</a>
        </div>
    @endif
</div>
