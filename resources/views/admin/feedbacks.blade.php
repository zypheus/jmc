@extends('layouts.sec')

@section('title', 'Attendance Feedback Report')

@section('styles')
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/admin/attendance-feedback-report.css') }}">
@endsection

@section('content')
@php
    $active = request('rating');
    $pct = fn (int $count): float => $total > 0 ? round(($count / $total) * 100, 1) : 0;

    $filters = [
        ['key' => null, 'label' => 'All', 'count' => $total, 'class' => ''],
        ['key' => 'excellent', 'label' => 'Excellent', 'count' => $excellent, 'class' => 'afr-filter--excellent'],
        ['key' => 'good', 'label' => 'Good', 'count' => $good, 'class' => 'afr-filter--good'],
        ['key' => 'medium', 'label' => 'Medium', 'count' => $medium, 'class' => 'afr-filter--medium'],
        ['key' => 'poor', 'label' => 'Poor', 'count' => $poor, 'class' => 'afr-filter--poor'],
        ['key' => 'very_bad', 'label' => 'Very bad', 'count' => $veryBad, 'class' => 'afr-filter--very-bad'],
        ['key' => 'declined', 'label' => 'Declined', 'count' => $declined, 'class' => 'afr-filter--declined'],
    ];

    $activeLabel = match ($active) {
        'excellent' => 'Excellent',
        'good' => 'Good',
        'medium' => 'Medium',
        'poor' => 'Poor',
        'very_bad' => 'Very bad',
        'declined' => 'Declined',
        default => 'All responses',
    };

    $ratingLabel = fn (?string $rating, bool $declined): string => match (true) {
        $declined => 'Declined',
        $rating === 'excellent' => 'Excellent',
        $rating === 'good' => 'Good',
        $rating === 'medium' => 'Medium',
        $rating === 'poor' => 'Poor',
        $rating === 'very_bad' => 'Very bad',
        default => 'No rating',
    };

    $ratingClass = fn (?string $rating, bool $declined): string => match (true) {
        $declined => 'afr-badge--declined',
        $rating === 'excellent' => 'afr-badge--excellent',
        $rating === 'good' => 'afr-badge--good',
        $rating === 'medium' => 'afr-badge--medium',
        $rating === 'poor' => 'afr-badge--poor',
        $rating === 'very_bad' => 'afr-badge--very-bad',
        default => 'afr-badge--none',
    };
@endphp

<div class="attendance-feedback-report">
    <header class="afr-hero">
        <div>
            <p class="afr-eyebrow">Attendance · checkout</p>
            <h1 class="afr-title">Exit feedback report</h1>
            <p class="afr-lede">
                Ratings collected when students leave the library. Filter by sentiment to review individual responses.
            </p>
        </div>

        <div class="afr-stamp" aria-label="{{ $total }} total responses">
            <span class="afr-stamp__label">Total responses</span>
            <span class="afr-stamp__value">{{ number_format($total) }}</span>
            <span class="afr-stamp__hint">Since tracking began</span>
        </div>
    </header>

    <nav class="afr-filters" aria-label="Filter by rating">
        @foreach ($filters as $filter)
            @php
                $isActive = ($filter['key'] === null && ! $active) || ($active === $filter['key']);
                $href = $filter['key']
                    ? route('attendance.feedback.index', ['rating' => $filter['key']])
                    : route('attendance.feedback.index');
            @endphp
            <a
                href="{{ $href }}"
                class="afr-filter {{ $filter['class'] }} {{ $isActive ? 'is-active' : '' }}"
                @if($isActive) aria-current="page" @endif
            >
                <span class="afr-filter__label">{{ $filter['label'] }}</span>
                <span class="afr-filter__count">{{ number_format($filter['count']) }}</span>
            </a>
        @endforeach
    </nav>

    @if ($total > 0)
        <section class="afr-distribution" aria-label="Overall sentiment distribution">
            <h2 class="afr-distribution__heading">Sentiment distribution</h2>

            <div class="afr-bar" role="img" aria-label="Distribution of {{ $total }} responses by rating">
                @if ($excellent > 0)
                    <div class="afr-bar__segment afr-bar__segment--excellent" style="width: {{ $pct($excellent) }}%" title="Excellent {{ $pct($excellent) }}%"></div>
                @endif
                @if ($good > 0)
                    <div class="afr-bar__segment afr-bar__segment--good" style="width: {{ $pct($good) }}%" title="Good {{ $pct($good) }}%"></div>
                @endif
                @if ($medium > 0)
                    <div class="afr-bar__segment afr-bar__segment--medium" style="width: {{ $pct($medium) }}%" title="Medium {{ $pct($medium) }}%"></div>
                @endif
                @if ($poor > 0)
                    <div class="afr-bar__segment afr-bar__segment--poor" style="width: {{ $pct($poor) }}%" title="Poor {{ $pct($poor) }}%"></div>
                @endif
                @if ($veryBad > 0)
                    <div class="afr-bar__segment afr-bar__segment--very-bad" style="width: {{ $pct($veryBad) }}%" title="Very bad {{ $pct($veryBad) }}%"></div>
                @endif
                @if ($declined > 0)
                    <div class="afr-bar__segment afr-bar__segment--declined" style="width: {{ $pct($declined) }}%" title="Declined {{ $pct($declined) }}%"></div>
                @endif
            </div>

            <div class="afr-legend">
                <span class="afr-legend__item"><span class="afr-legend__dot" style="background: var(--afr-excellent)"></span> Excellent {{ $pct($excellent) }}%</span>
                <span class="afr-legend__item"><span class="afr-legend__dot" style="background: var(--afr-good)"></span> Good {{ $pct($good) }}%</span>
                <span class="afr-legend__item"><span class="afr-legend__dot" style="background: var(--afr-medium)"></span> Medium {{ $pct($medium) }}%</span>
                <span class="afr-legend__item"><span class="afr-legend__dot" style="background: var(--afr-poor)"></span> Poor {{ $pct($poor) }}%</span>
                <span class="afr-legend__item"><span class="afr-legend__dot" style="background: var(--afr-very-bad)"></span> Very bad {{ $pct($veryBad) }}%</span>
                <span class="afr-legend__item"><span class="afr-legend__dot" style="background: var(--afr-declined)"></span> Declined {{ $pct($declined) }}%</span>
            </div>
        </section>
    @endif

    <section class="afr-panel">
        <div class="afr-panel__head">
            <h2 class="afr-panel__title">{{ $activeLabel }}</h2>
            <span class="afr-panel__meta">{{ number_format($feedbacks->count()) }} {{ $feedbacks->count() === 1 ? 'record' : 'records' }}</span>
        </div>

        @if ($feedbacks->isEmpty())
            <div class="afr-empty">
                <p class="afr-empty__title">No responses in this view</p>
                <p class="afr-empty__text">
                    @if ($active)
                        No students rated their visit as “{{ strtolower($activeLabel) }}”. Choose another filter or view all responses.
                    @else
                        Responses will appear here once students submit exit feedback at checkout.
                    @endif
                </p>
            </div>
        @else
            <div class="afr-table-wrap">
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Student</th>
                            <th scope="col">Rating</th>
                            <th scope="col">Declined</th>
                            <th scope="col">Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($feedbacks as $index => $feedback)
                            @php
                                $lastname = optional($feedback->student)->lastname ?? '';
                                $firstname = optional($feedback->student)->firstname ?? '';
                                $studentName = trim("{$lastname}, {$firstname}", ', ') ?: 'Unknown student';
                            @endphp
                            <tr>
                                <td class="afr-num">{{ $index + 1 }}</td>
                                <td class="afr-student">{{ $studentName }}</td>
                                <td>
                                    <span class="afr-badge {{ $ratingClass($feedback->rating, (bool) $feedback->declined) }}">
                                        {{ $ratingLabel($feedback->rating, (bool) $feedback->declined) }}
                                    </span>
                                </td>
                                <td>
                                    @if ($feedback->declined)
                                        <span class="afr-yes">Yes</span>
                                    @else
                                        <span class="afr-no">No</span>
                                    @endif
                                </td>
                                <td class="afr-date">{{ $feedback->created_at?->format('M j, Y · g:i A') }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </section>
</div>
@endsection
