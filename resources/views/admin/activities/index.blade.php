@extends('layouts.sec')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/admin/activities.css') }}">
@endsection

@section('content')
@php
    $filterParams = array_filter([
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
    ]);
@endphp
<div class="activity-page">
    <header class="activity-page__head d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
        <div>
            <h1 class="h3 mb-1">Activity log</h1>
            <p class="text-muted mb-0">Patron notifications and staff actions, separated by tab.</p>
        </div>
        <a href="{{ route('library.book.index') }}" class="btn btn-outline-secondary btn-sm">← Catalog</a>
    </header>

    <form method="GET" action="{{ route('library.admin.activities.index') }}" class="activity-filter card mb-3">
        <div class="card-body">
            <input type="hidden" name="category" value="{{ $category }}">
            <div class="row g-2 align-items-end">
                <div class="col-sm-auto">
                    <label for="date_from" class="form-label small mb-1">From</label>
                    <input type="date" name="date_from" id="date_from" class="form-control form-control-sm" value="{{ $dateFrom }}">
                </div>
                <div class="col-sm-auto">
                    <label for="date_to" class="form-label small mb-1">To</label>
                    <input type="date" name="date_to" id="date_to" class="form-control form-control-sm" value="{{ $dateTo }}">
                </div>
                <div class="col-sm-auto d-flex gap-2">
                    <button type="submit" class="btn btn-primary btn-sm">Apply</button>
                    <a href="{{ route('library.admin.activities.index', ['category' => $category]) }}" class="btn btn-outline-secondary btn-sm">Clear dates</a>
                </div>
            </div>
        </div>
    </form>

    <ul class="nav nav-pills activity-pills flex-wrap mb-3" role="tablist">
        <li class="nav-item" role="presentation">
            <a class="nav-link {{ $category === 'patron' ? 'active' : '' }}"
               href="{{ route('library.admin.activities.index', array_merge($filterParams, ['category' => 'patron'])) }}">
                Patron notifications
            </a>
        </li>
        <li class="nav-item" role="presentation">
            <a class="nav-link {{ $category === 'staff' ? 'active' : '' }}"
               href="{{ route('library.admin.activities.index', array_merge($filterParams, ['category' => 'staff'])) }}">
                Staff activity
            </a>
        </li>
    </ul>

    <div class="card activity-feed-card">
        <div class="list-group list-group-flush">
            @include('admin.activities.partials.feed', ['activities' => $activities, 'category' => $category])
        </div>
    </div>

    </div>

    @include('layouts.partials.pagination_bar', ['paginator' => $activities])
</div>
@endsection
