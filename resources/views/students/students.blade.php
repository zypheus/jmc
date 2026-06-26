@extends('layouts.sec')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/patrons/directory.css') }}">
    <link rel="stylesheet" href="{{ asset('css/layout/skeleton.css') }}">
@endsection

@section('content')
<div class="patron-dir">
    <header class="patron-dir__hero">
        <div>
            <p class="patron-dir__eyebrow">Patron data</p>
            <h1 class="patron-dir__title">Students</h1>
            <p class="patron-dir__subtitle">Search, register, and manage student patron records.</p>
        </div>
        <div class="patron-dir__hero-actions">
            <a href="{{ route('library.students.create') }}" class="patron-dir__btn patron-dir__btn--primary">+ Register student</a>
            <a href="{{ route('library.book.index') }}" class="patron-dir__btn patron-dir__btn--outline">← Catalog</a>
        </div>
    </header>

    @include('patrons.partials.type_tabs', ['active' => 'students'])

    @include('patrons.partials.quick_actions_student')

    @if(session('success'))
        <div class="alert alert-success patron-dir__alert">{{ session('success') }}</div>
    @endif

    <div class="patron-dir__toolbar">
        <form id="students-filter-form" action="{{ route('library.students.index') }}" method="GET" class="patron-dir__filters">
            <div class="patron-dir__field">
                <label for="student_search">Search</label>
                <input type="text" name="search" id="student_search" class="form-control"
                       placeholder="Name, ID, course, QR…" value="{{ request('search') }}">
            </div>
            <div class="patron-dir__field">
                <label for="student_program">Program</label>
                <select name="program_id" id="student_program" class="form-select">
                    <option value="">All programs</option>
                    @foreach ($programs as $program)
                        <option value="{{ $program->program_code }}" @selected(request('program_id') == $program->program_code)>
                            {{ $program->program_name }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="patron-dir__field">
                <label for="student_year">Year level</label>
                <select name="year" id="student_year" class="form-select">
                    <option value="">All years</option>
                    @foreach (['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'] as $yr)
                        <option value="{{ $yr }}" @selected(request('year') == $yr)>{{ $yr }}</option>
                    @endforeach
                </select>
            </div>
            <div class="patron-dir__filter-btn">
                <button type="submit" class="patron-dir__btn patron-dir__btn--outline">Apply</button>
            </div>
        </form>
    </div>

    <details class="patron-dir__import">
        <summary>Import students from spreadsheet</summary>
        <div class="patron-dir__import-body">
            <form action="{{ route('library.students.import') }}" method="POST" enctype="multipart/form-data" class="d-flex flex-wrap align-items-center gap-2 mb-0">
                @csrf
                <input type="file" name="file" class="form-control form-control-sm" accept=".xlsx,.csv" required>
                <button type="submit" class="patron-dir__btn patron-dir__btn--outline">Upload</button>
            </form>
        </div>
    </details>

    <div class="patron-dir__meta">
        <span class="patron-dir__meta-item"><strong>{{ number_format($students->total()) }}</strong> registered</span>
        @if(request()->hasAny(['search', 'program_id', 'year', 'per_page']))
            <span class="patron-dir__meta-item">
                <a href="{{ route('library.students.index') }}" class="text-decoration-none">Clear filters</a>
            </span>
        @endif
    </div>

    <div class="patron-dir__card">
        <div id="students-data-panel"
             data-hydratable-panel
             data-loading="false"
             data-form="#students-filter-form"
             data-skeleton="#students-table-skeleton"
             data-pagination=".data-panel-pagination"
             data-path-match="/students">
            @include('students.partials.list-table', ['students' => $students, 'programs' => $programs])
        </div>
    </div>
</div>

<template id="students-table-skeleton">
    @include('partials.skeleton-table', [
        'columns' => 4,
        'rows' => 8,
        'loadingLabel' => 'Loading students…',
        'headers' => ['Student', 'Program', 'Year', 'Actions'],
        'skeletonFirstCol' => 'avatar',
    ])
</template>
@endsection
