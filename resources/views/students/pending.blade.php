@extends('layouts.sec')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/patrons/directory.css') }}">
@endsection

@section('content')
<div class="patron-dir">
    <header class="patron-dir__hero">
        <div>
            <p class="patron-dir__eyebrow">Patron data</p>
            <h1 class="patron-dir__title">Pending student registrations</h1>
            <p class="patron-dir__subtitle">Review and approve student patron applications.</p>
        </div>
        <div class="patron-dir__hero-actions">
            <a href="{{ route('library.pending.index') }}" class="patron-dir__btn patron-dir__btn--outline">← Pending queue</a>
            <a href="{{ route('library.students.index') }}" class="patron-dir__btn patron-dir__btn--outline">Student directory</a>
        </div>
    </header>

    @if(session('success'))
        <div class="alert alert-success patron-dir__alert">{{ session('success') }}</div>
    @endif

    <div class="patron-dir__card">
        @if($pendingStudents->isEmpty())
            <div class="patron-dir__empty p-4">
                <p class="mb-0">No pending student registrations.</p>
            </div>
        @else
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>Applicant</th>
                            <th>Program</th>
                            <th>Year</th>
                            <th class="text-end">Decision</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($pendingStudents as $p)
                            <tr>
                                <td>{{ $p->lastname }}, {{ $p->firstname }} @if($p->id_number) <span class="text-muted small">({{ $p->id_number }})</span> @endif</td>
                                <td>{{ $p->course ?: '—' }}</td>
                                <td>{{ $p->year ?: '—' }}</td>
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
        @endif
    </div>
</div>
@endsection
