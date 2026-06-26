@extends('layouts.sec')

@section('title', 'Prospectus Manager')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/patrons/directory.css') }}">
    <link rel="stylesheet" href="{{ asset('css/prospectus/page.css') }}">
@endsection

@section('content')
@php
    $yearLabels = [1 => '1st Year', 2 => '2nd Year', 3 => '3rd Year', 4 => '4th Year', 5 => '5th Year', 6 => '6th Year'];
@endphp
<div id="prospectus-page" class="prog-mgr">
    <header class="prog-mgr__hero">
        <div>
            <p class="prog-mgr__eyebrow">Admin · curriculum</p>
            <h1 class="prog-mgr__title">Prospectus manager</h1>
            <p class="prog-mgr__subtitle">
                Maintain programs, year levels, and courses used for patron records, ebooks, and catalog linking.
            </p>
        </div>
        <div class="prog-mgr__hero-actions">
            <a href="{{ route('library.book.index') }}" class="prog-mgr__btn prog-mgr__btn--outline">← Catalog</a>
        </div>
    </header>

    @if(session('success'))
        <div class="alert alert-success prog-mgr__alert">{{ session('success') }}</div>
    @endif

    <div class="prog-mgr__stats" aria-label="Prospectus summary">
        <div class="prog-mgr__stat">
            <span class="prog-mgr__stat-label">Programs</span>
            <span class="prog-mgr__stat-value">{{ number_format($stats['programs']) }}</span>
        </div>
        <div class="prog-mgr__stat">
            <span class="prog-mgr__stat-label">Courses</span>
            <span class="prog-mgr__stat-value">{{ number_format($stats['courses']) }}</span>
        </div>
        <div class="prog-mgr__stat">
            <span class="prog-mgr__stat-label">Showing</span>
            <span class="prog-mgr__stat-value">{{ number_format($programs->count()) }}</span>
        </div>
    </div>

    <div class="prog-mgr__card">
        <h2 class="prog-mgr__card-title">Add program or strand</h2>
        <form method="POST" action="{{ route('library.prospectus.storeProgram') }}" class="prog-mgr__add-form">
            @csrf
            <div class="prog-mgr__field">
                <label for="program_code">Code</label>
                <input type="text" name="program_code" id="program_code" class="form-control"
                       placeholder="e.g. BSIT" value="{{ old('program_code') }}" required maxlength="50">
            </div>
            <div class="prog-mgr__field">
                <label for="program_name">Program name</label>
                <input type="text" name="program_name" id="program_name" class="form-control"
                       placeholder="Bachelor of Science in Information Technology" value="{{ old('program_name') }}" required maxlength="255">
            </div>
            <div class="prog-mgr__field">
                <label for="total_years">Years</label>
                <input type="number" name="total_years" id="total_years" class="form-control"
                       min="1" max="6" value="{{ old('total_years', 4) }}" required>
            </div>
            <div class="prog-mgr__field">
                <label>&nbsp;</label>
                <button type="submit" class="prog-mgr__btn prog-mgr__btn--primary w-100">Add program</button>
            </div>
        </form>
    </div>

    <div class="prog-mgr__card">
        <h2 class="prog-mgr__card-title">Search programs &amp; courses</h2>
        <form method="GET" action="{{ route('library.prospectus.index') }}" class="prog-mgr__search-form">
            <input type="text" name="search" class="form-control" placeholder="Program code, name, or course…"
                   value="{{ $search }}">
            <button type="submit" class="prog-mgr__btn prog-mgr__btn--primary">Search</button>
            @if($search)
                <a href="{{ route('library.prospectus.index') }}" class="prog-mgr__btn prog-mgr__btn--outline">Clear</a>
            @endif
        </form>
    </div>

    @if($programs->isEmpty())
        <div class="prog-mgr__empty">
            @if($search)
                <p class="mb-2">No programs or courses match your search.</p>
                <a href="{{ route('library.prospectus.index') }}" class="prog-mgr__btn prog-mgr__btn--outline">Clear search</a>
            @else
                <p class="mb-0">No programs yet. Add your first program above.</p>
            @endif
        </div>
    @else
        <div class="prog-mgr__programs">
            @foreach($programs as $program)
                @php
                    $courseCount = $program->years->sum(fn ($year) => $year->courses->count());
                @endphp
                <article id="program-card-{{ $program->id }}" class="prog-mgr__program {{ $loop->first ? 'is-expanded' : '' }}">
                    <div class="prog-mgr__program-header">
                        <div class="prog-mgr__program-info">
                            <span class="prog-mgr__program-code" id="program-code-{{ $program->id }}">{{ $program->program_code }}</span>
                            <h3 class="prog-mgr__program-name" id="program-name-{{ $program->id }}">{{ $program->program_name }}</h3>
                            <p class="prog-mgr__program-meta">
                                {{ $program->total_years }} {{ Str::plural('year', $program->total_years) }}
                                · {{ $courseCount }} {{ Str::plural('course', $courseCount) }}
                            </p>
                        </div>
                        <div class="prog-mgr__program-actions">
                            <button type="button" class="prog-mgr__btn prog-mgr__btn--outline prog-mgr__btn--sm"
                                    data-action="toggle-program" data-program-id="{{ $program->id }}">
                                <span data-toggle-label>Expand</span>
                            </button>
                            <button type="button" class="prog-mgr__btn prog-mgr__btn--outline prog-mgr__btn--sm"
                                    data-action="edit-program"
                                    data-program-id="{{ $program->id }}"
                                    data-program-code="{{ $program->program_code }}"
                                    data-program-name="{{ $program->program_name }}">
                                Edit
                            </button>
                            <button type="button" class="prog-mgr__btn prog-mgr__btn--danger prog-mgr__btn--sm"
                                    data-action="delete-program"
                                    data-program-id="{{ $program->id }}"
                                    data-program-code="{{ $program->program_code }}">
                                Delete
                            </button>
                        </div>
                    </div>

                    <div id="program-body-{{ $program->id }}" class="prog-mgr__program-body">
                        <div class="prog-mgr__years">
                            @foreach($program->years as $year)
                                <section class="prog-mgr__year" id="year-block-{{ $year->id }}">
                                    <div class="prog-mgr__year-header">
                                        <h4 class="prog-mgr__year-title">
                                            {{ $yearLabels[$year->year_level] ?? 'Year ' . $year->year_level }}
                                        </h4>
                                        <span class="prog-mgr__year-count">{{ $year->courses->count() }} courses</span>
                                    </div>

                                    <ul id="year-{{ $year->id }}" class="prog-mgr__course-list" data-year-id="{{ $year->id }}">
                                        @forelse($year->courses as $course)
                                            @include('prospectus.partials.course_item', ['course' => $course])
                                        @empty
                                            <li class="prog-mgr__course-empty" data-empty-row>No courses yet.</li>
                                        @endforelse
                                    </ul>

                                    <form method="POST" action="{{ route('library.prospectus.storeCourse', $year->id) }}"
                                          class="prog-mgr__add-course add-course-form" data-year="{{ $year->id }}">
                                        @csrf
                                        <input type="text" name="course_code" class="form-control" placeholder="Course code" required maxlength="50">
                                        <input type="text" name="course_name" class="form-control" placeholder="Course name" required maxlength="255">
                                        <button type="submit" class="prog-mgr__btn prog-mgr__btn--primary prog-mgr__btn--sm">
                                            <span class="prog-mgr__btn-text">Add</span>
                                            <span class="prog-mgr__spinner" aria-hidden="true"></span>
                                        </button>
                                    </form>
                                </section>
                            @endforeach
                        </div>
                    </div>
                </article>
            @endforeach
        </div>
    @endif
</div>

@include('prospectus.partials.modals')

<div id="prog-mgr-toast-container" aria-live="polite" aria-atomic="true"></div>
@endsection

@push('scripts')
    <script src="{{ asset('js/prospectus.js') }}"></script>
@endpush
