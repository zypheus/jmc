<div class="data-panel-table-wrap">
    @if($students->total() > 0)
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Program</th>
                        <th>Year</th>
                        <th class="text-end" style="width: 3rem;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($students as $student)
                        @php
                            $programLabel = $programs->firstWhere('program_code', $student->course)?->program_name
                                ?? $student->course;
                        @endphp
                        <tr>
                            <td>
                                <div class="patron-dir__person">
                                    @if($student->profile_picture)
                                        <img src="{{ asset($student->profile_picture) }}" alt="" class="patron-dir__avatar" loading="lazy" width="48" height="48">
                                    @else
                                        <span class="patron-dir__avatar patron-dir__avatar--empty">N/A</span>
                                    @endif
                                    <div>
                                        <div class="patron-dir__person-name">
                                            {{ $student->lastname }}, {{ $student->firstname }}
                                        </div>
                                        <div class="patron-dir__person-meta">
                                            @if($student->id_number)
                                                ID {{ $student->id_number }}
                                            @endif
                                            @if($student->qrcode)
                                                · <span class="patron-dir__code">{{ $student->qrcode }}</span>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td><span class="patron-dir__chip">{{ $programLabel ?: '—' }}</span></td>
                            <td><span class="patron-dir__chip patron-dir__chip--muted">{{ $student->year ?: '—' }}</span></td>
                            <td class="text-end">
                                @include('patrons.partials.row_menu_student', ['student' => $student])
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @include('layouts.partials.pagination_bar', ['paginator' => $students])
    @else
        <div class="patron-dir__empty">
            <div class="patron-dir__empty-icon">🎓</div>
            <p class="mb-2">No students match your filters.</p>
            <a href="{{ route('library.students.create') }}" class="patron-dir__btn patron-dir__btn--primary">Register first student</a>
        </div>
    @endif
</div>
