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
            <h1 class="patron-dir__title">Faculty &amp; staff</h1>
            <p class="patron-dir__subtitle">Search, register, and manage employee patron records.</p>
        </div>
        <div class="patron-dir__hero-actions">
            <a href="{{ route('library.employees.create') }}" class="patron-dir__btn patron-dir__btn--primary">+ Register patron</a>
            <a href="{{ route('library.book.index') }}" class="patron-dir__btn patron-dir__btn--outline">← Catalog</a>
        </div>
    </header>

    @include('patrons.partials.type_tabs', ['active' => 'employees'])

    @include('patrons.partials.quick_actions_employee')

    @if(session('success'))
        <div class="alert alert-success patron-dir__alert">{{ session('success') }}</div>
    @endif
    @if(session('error'))
        <div class="alert alert-danger patron-dir__alert">{{ session('error') }}</div>
    @endif

    <div class="patron-dir__toolbar">
        <form id="employees-filter-form" action="{{ route('library.employees.index') }}" method="GET" class="patron-dir__filters">
            <div class="patron-dir__field">
                <label for="employee_search">Search</label>
                <input type="text" name="search" id="employee_search" class="form-control"
                       placeholder="Name, ID, designation…" value="{{ request('search') }}">
            </div>
            <div class="patron-dir__field">
                <label for="employee_program">Program</label>
                <select name="program" id="employee_program" class="form-select">
                    <option value="">All programs</option>
                    @foreach ($programs as $program)
                        <option value="{{ $program->program_code }}" @selected(request('program') === $program->program_code)>
                            {{ $program->program_name }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="patron-dir__field">
                <label for="employee_start_year">Start year</label>
                <select name="year_start_work" id="employee_start_year" class="form-select">
                    <option value="">All years</option>
                    @foreach ($workStartYears as $yr)
                        <option value="{{ $yr }}" @selected(request('year_start_work') == (string) $yr)>{{ $yr }}</option>
                    @endforeach
                </select>
            </div>
            <div class="patron-dir__filter-btn">
                <button type="submit" class="patron-dir__btn patron-dir__btn--outline">Apply</button>
            </div>
        </form>
    </div>

    <div class="patron-dir__meta">
        <span class="patron-dir__meta-item"><strong>{{ number_format($faculty->total()) }}</strong> registered</span>
        @if(request()->hasAny(['search', 'program', 'year_start_work', 'per_page']))
            <span class="patron-dir__meta-item">
                <a href="{{ route('library.employees.index') }}" class="text-decoration-none">Clear filters</a>
            </span>
        @endif
    </div>

    <div class="patron-dir__card">
        <div id="employees-data-panel"
             data-hydratable-panel
             data-loading="false"
             data-form="#employees-filter-form"
             data-skeleton="#employees-table-skeleton"
             data-pagination=".data-panel-pagination"
             data-path-match="/employees">
            @include('employees.partials.list-table', ['faculty' => $faculty, 'programs' => $programs])
        </div>
    </div>
</div>

<template id="employees-table-skeleton">
    @include('partials.skeleton-table', [
        'columns' => 5,
        'rows' => 8,
        'loadingLabel' => 'Loading faculty & staff…',
        'headers' => ['Patron', 'Designation', 'Program', 'Start', 'Actions'],
        'skeletonFirstCol' => 'avatar',
    ])
</template>
@endsection
