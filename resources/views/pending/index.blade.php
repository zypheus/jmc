@extends('layouts.sec')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/patrons/directory.css') }}">
    <link rel="stylesheet" href="{{ asset('css/layout/skeleton.css') }}">
@endsection

@section('content')
@php
    $studentCount = $pendingStudents->total();
    $employeeCount = $pendingEmployees->total();
    $activeTab = $defaultTab ?? request('tab', 'students');
@endphp
<div class="patron-dir">
    <header class="patron-dir__hero">
        <div>
            <p class="patron-dir__eyebrow">Patron data · review queue</p>
            <h1 class="patron-dir__title">Pending registrations</h1>
            <p class="patron-dir__subtitle">Approve or reject self-service sign-ups before they appear in the directory.</p>
        </div>
        <div class="patron-dir__hero-actions">
            <a href="{{ $backRoute ?? route('library.students.index') }}" class="patron-dir__btn patron-dir__btn--outline">← Back to directory</a>
        </div>
    </header>

    @if(session('success'))
        <div class="alert alert-success patron-dir__alert">{{ session('success') }}</div>
    @endif
    @if(session('error'))
        <div class="alert alert-danger patron-dir__alert">{{ session('error') }}</div>
    @endif

    <div class="patron-dir__stats">
        <div class="patron-dir__stat-card {{ $studentCount > 0 ? 'patron-dir__stat-card--alert' : '' }}">
            <div class="patron-dir__stat-card__value">{{ number_format($studentCount) }}</div>
            <div class="patron-dir__stat-card__label">Students waiting</div>
        </div>
        <div class="patron-dir__stat-card {{ $employeeCount > 0 ? 'patron-dir__stat-card--alert' : '' }}">
            <div class="patron-dir__stat-card__value">{{ number_format($employeeCount) }}</div>
            <div class="patron-dir__stat-card__label">Faculty &amp; staff waiting</div>
        </div>
    </div>

    <div class="patron-dir__toolbar">
        <form id="pending-filter-form" method="GET" action="{{ route('library.pending.index') }}" class="patron-dir__filters">
            <input type="hidden" name="tab" id="pendingTab" value="{{ $activeTab }}">
            <div class="patron-dir__field" style="flex: 2 1 220px;">
                <label for="pending_search">Search</label>
                <input type="text" name="search" id="pending_search" class="form-control"
                       placeholder="Name, ID, program…" value="{{ $search ?? request('search') }}">
            </div>
            <div class="patron-dir__filter-btn">
                <button type="submit" class="patron-dir__btn patron-dir__btn--outline">Search</button>
            </div>
            @if(request()->filled('search'))
                <div class="patron-dir__filter-btn">
                    <a href="{{ route('library.pending.index', ['tab' => $activeTab]) }}" class="patron-dir__btn patron-dir__btn--outline">Clear</a>
                </div>
            @endif
        </form>
    </div>

    <nav class="patron-dir__tabs" aria-label="Pending registration type" role="tablist">
        <button type="button"
                id="pending-tab-students"
                class="patron-dir__tab {{ $activeTab === 'students' ? 'active' : '' }}"
                role="tab"
                aria-selected="{{ $activeTab === 'students' ? 'true' : 'false' }}"
                aria-controls="pending-panel-students"
                data-pending-tab="students">
            Students
            @if($studentCount > 0)
                <span class="patron-dir__quick-action-count">{{ $studentCount }}</span>
            @endif
        </button>
        <button type="button"
                id="pending-tab-employees"
                class="patron-dir__tab {{ $activeTab === 'employees' ? 'active' : '' }}"
                role="tab"
                aria-selected="{{ $activeTab === 'employees' ? 'true' : 'false' }}"
                aria-controls="pending-panel-employees"
                data-pending-tab="employees">
            Faculty &amp; staff
            @if($employeeCount > 0)
                <span class="patron-dir__quick-action-count">{{ $employeeCount }}</span>
            @endif
        </button>
    </nav>

    <div id="pending-panel-students"
         class="patron-dir__pending-panel {{ $activeTab === 'students' ? 'is-active' : '' }}"
         role="tabpanel"
         aria-labelledby="pending-tab-students"
         data-hydratable-panel
         data-loading="false"
         data-form="#pending-filter-form"
         data-skeleton="#pending-students-skeleton"
         data-pagination=".data-panel-pagination"
         data-path-match="/pending"
         data-enabled-when-visible="true"
         data-tab-input="#pendingTab">
        @include('pending.partials.students-table', [
            'pendingStudents' => $pendingStudents,
            'programs' => $programs,
            'search' => $search ?? request('search'),
        ])
    </div>

    <div id="pending-panel-employees"
         class="patron-dir__pending-panel {{ $activeTab === 'employees' ? 'is-active' : '' }}"
         role="tabpanel"
         aria-labelledby="pending-tab-employees"
         data-hydratable-panel
         data-loading="false"
         data-form="#pending-filter-form"
         data-skeleton="#pending-employees-skeleton"
         data-pagination=".data-panel-pagination"
         data-path-match="/pending"
         data-enabled-when-visible="true"
         data-tab-input="#pendingTab">
        @include('pending.partials.employees-table', [
            'pendingEmployees' => $pendingEmployees,
            'programs' => $programs,
            'search' => $search ?? request('search'),
        ])
    </div>
</div>

<template id="pending-students-skeleton">
    @include('partials.skeleton-table', [
        'columns' => 5,
        'rows' => 8,
        'loadingLabel' => 'Loading pending students…',
        'headers' => ['Applicant', 'Program', 'Year', 'Submitted', 'Decision'],
        'skeletonFirstCol' => 'avatar',
    ])
</template>

<template id="pending-employees-skeleton">
    @include('partials.skeleton-table', [
        'columns' => 6,
        'rows' => 8,
        'loadingLabel' => 'Loading pending faculty & staff…',
        'headers' => ['Applicant', 'Designation', 'Program', 'Start year', 'Submitted', 'Decision'],
        'skeletonFirstCol' => 'avatar',
    ])
</template>
@endsection
