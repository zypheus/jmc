@extends('layouts.sec')

@section('title', 'Student Feedback')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/patrons/directory.css') }}">
    <link rel="stylesheet" href="{{ asset('css/feedbacks/page.css') }}">
@endsection

@section('content')
@php
    $queryParams = request()->query();
    $hasFilters = request()->filled('search')
        || request()->filled('from')
        || request()->filled('to')
        || request()->filled('contact')
        || (request('sort') && request('sort') !== 'newest');
@endphp
<div class="fb-inbox">
    <header class="fb-inbox__hero">
        <div>
            <p class="fb-inbox__eyebrow">Reports · patron feedback</p>
            <h1 class="fb-inbox__title">Student feedback</h1>
            <p class="fb-inbox__subtitle">
                Free-text comments submitted through the public feedback form. Review messages from students and visitors.
            </p>
            <p class="fb-inbox__note">
                For star ratings collected at library checkout, see
                <a href="{{ route('attendance.feedback.index') }}">Gate feedback responses</a>.
            </p>
        </div>
        <div class="fb-inbox__hero-actions">
            <a href="{{ route('library.feedback.create') }}" target="_blank" rel="noopener" class="fb-inbox__btn fb-inbox__btn--outline">Public form</a>
            <a href="{{ route('library.book.index') }}" class="fb-inbox__btn fb-inbox__btn--outline">← Catalog</a>
        </div>
    </header>

    @if(session('success'))
        <div class="alert alert-success fb-inbox__alert">{{ session('success') }}</div>
    @endif

    <div class="fb-inbox__stats" aria-label="Feedback summary">
        <div class="fb-inbox__stat">
            <span class="fb-inbox__stat-label">All time</span>
            <span class="fb-inbox__stat-value">{{ number_format($stats['total']) }}</span>
        </div>
        <div class="fb-inbox__stat">
            <span class="fb-inbox__stat-label">This week</span>
            <span class="fb-inbox__stat-value">{{ number_format($stats['this_week']) }}</span>
        </div>
        <div class="fb-inbox__stat">
            <span class="fb-inbox__stat-label">This month</span>
            <span class="fb-inbox__stat-value">{{ number_format($stats['this_month']) }}</span>
        </div>
    </div>

    <nav class="fb-inbox__quick-actions" aria-label="Feedback actions">
        <a href="{{ route('library.feedback.create') }}" target="_blank" rel="noopener" class="fb-inbox__quick-action fb-inbox__quick-action--primary">
            Open public feedback form
        </a>
        <a href="{{ route('library.feedback.export.csv', $queryParams) }}" class="fb-inbox__quick-action">
            Export CSV
        </a>
        <a href="{{ route('attendance.feedback.index') }}" class="fb-inbox__quick-action">
            Gate feedback responses
        </a>
    </nav>

    <div class="fb-inbox__filters-card">
        <form method="GET" action="{{ route('library.feedback.index') }}" class="fb-inbox__filters">
            <div class="fb-inbox__field" style="flex: 2 1 220px;">
                <label for="fb_search">Search</label>
                <input type="text" name="search" id="fb_search" class="form-control"
                       placeholder="Name, email, comment text…" value="{{ request('search') }}">
            </div>
            <div class="fb-inbox__field">
                <label for="fb_from">From</label>
                <input type="date" name="from" id="fb_from" class="form-control" value="{{ request('from') }}">
            </div>
            <div class="fb-inbox__field">
                <label for="fb_to">To</label>
                <input type="date" name="to" id="fb_to" class="form-control" value="{{ request('to') }}">
            </div>
            <div class="fb-inbox__field">
                <label for="fb_contact">Contact</label>
                <select name="contact" id="fb_contact" class="form-select">
                    <option value="">All submissions</option>
                    <option value="identified" @selected(request('contact') === 'identified')>With name or email</option>
                    <option value="anonymous" @selected(request('contact') === 'anonymous')>Anonymous only</option>
                </select>
            </div>
            <div class="fb-inbox__field">
                <label for="fb_sort">Sort</label>
                <select name="sort" id="fb_sort" class="form-select">
                    <option value="newest" @selected(request('sort', 'newest') === 'newest')>Newest first</option>
                    <option value="oldest" @selected(request('sort') === 'oldest')>Oldest first</option>
                </select>
            </div>
            <div class="fb-inbox__filter-actions">
                <button type="submit" class="fb-inbox__btn fb-inbox__btn--primary">Apply filters</button>
                @if($hasFilters)
                    <a href="{{ route('library.feedback.index') }}" class="fb-inbox__btn fb-inbox__btn--outline">Clear</a>
                @endif
            </div>
        </form>
    </div>

    <div class="fb-inbox__meta">
        <span>
            <strong>{{ number_format($feedbacks->total()) }}</strong>
            {{ $feedbacks->total() === 1 ? 'submission' : 'submissions' }} found
        </span>
        @if($hasFilters)
            <span>Filters active</span>
        @endif
    </div>

    <div class="fb-inbox__card">
        @if($feedbacks->total() > 0)
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th style="width: 3rem;">#</th>
                            <th>From</th>
                            <th>Comment</th>
                            <th style="width: 11rem;">Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($feedbacks as $index => $feedback)
                            @php
                                $isAnonymous = blank($feedback->name) && blank($feedback->email);
                                $submitted = $feedback->created_at?->timezone('Asia/Manila');
                                $preview = \Illuminate\Support\Str::limit($feedback->comments, 200);
                                $isTruncated = strlen($feedback->comments) > strlen($preview);
                            @endphp
                            <tr>
                                <td class="text-muted">{{ $feedbacks->firstItem() + $index }}</td>
                                <td>
                                    <div class="fb-inbox__person-name">
                                        {{ $feedback->name ?: 'Anonymous' }}
                                    </div>
                                    @if($isAnonymous)
                                        <span class="fb-inbox__chip">Anonymous</span>
                                    @else
                                        <span class="fb-inbox__chip fb-inbox__chip--identified">Identified</span>
                                    @endif
                                    @if($feedback->email)
                                        <div class="mt-1">
                                            <a href="mailto:{{ $feedback->email }}" class="fb-inbox__email">{{ $feedback->email }}</a>
                                        </div>
                                    @endif
                                </td>
                                <td>
                                    <div class="fb-inbox__comment">{{ $preview }}</div>
                                    @if($isTruncated)
                                        <template id="fb-comment-{{ $feedback->id }}">{{ $feedback->comments }}</template>
                                        <button
                                            type="button"
                                            class="fb-inbox__read-more"
                                            data-bs-toggle="modal"
                                            data-bs-target="#feedbackDetailModal"
                                            data-feedback-id="{{ $feedback->id }}"
                                            data-name="{{ $feedback->name ?: 'Anonymous' }}"
                                            data-email="{{ $feedback->email ?? '' }}"
                                            data-contact="{{ $isAnonymous ? 'Anonymous' : 'Identified' }}"
                                            data-submitted="{{ $submitted?->format('M j, Y g:i A') ?? '' }}"
                                        >Read full comment</button>
                                    @endif
                                </td>
                                <td>
                                    @if($submitted)
                                        <span class="fb-inbox__time">
                                            {{ $submitted->format('M j, Y') }}
                                            <small>{{ $submitted->format('g:i A') }} · {{ $submitted->diffForHumans() }}</small>
                                        </span>
                                    @else
                                        <span class="text-muted">—</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @include('layouts.partials.pagination_bar', ['paginator' => $feedbacks])
        @else
            <div class="fb-inbox__empty">
                <p class="mb-2">No feedback matches your filters.</p>
                @if($hasFilters)
                    <a href="{{ route('library.feedback.index') }}" class="fb-inbox__btn fb-inbox__btn--outline">Clear filters</a>
                @else
                    <p class="mb-2 small">Patrons can submit comments at the public form.</p>
                    <a href="{{ route('library.feedback.create') }}" target="_blank" rel="noopener" class="fb-inbox__btn fb-inbox__btn--outline">Open public form</a>
                @endif
            </div>
        @endif
    </div>
</div>

<div class="modal fade" id="feedbackDetailModal" tabindex="-1" aria-labelledby="feedbackDetailTitle" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content fb-inbox__modal">
            <div class="modal-header">
                <h5 class="modal-title" id="feedbackDetailTitle">Feedback</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <dl class="fb-inbox__modal-meta">
                    <div>
                        <dt>From</dt>
                        <dd id="feedbackDetailName">—</dd>
                    </div>
                    <div>
                        <dt>Email</dt>
                        <dd id="feedbackDetailEmail">—</dd>
                    </div>
                    <div>
                        <dt>Contact</dt>
                        <dd id="feedbackDetailContact">—</dd>
                    </div>
                    <div>
                        <dt>Submitted</dt>
                        <dd id="feedbackDetailSubmitted">—</dd>
                    </div>
                </dl>
                <h6 class="fb-inbox__modal-heading">Comment</h6>
                <div id="feedbackDetailComment" class="fb-inbox__modal-comment"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="fb-inbox__btn fb-inbox__btn--outline" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('feedbackDetailModal');
    if (!modal) return;

    modal.addEventListener('show.bs.modal', function (event) {
        const trigger = event.relatedTarget;
        if (!trigger) return;

        const id = trigger.getAttribute('data-feedback-id');
        const template = id ? document.getElementById('fb-comment-' + id) : null;
        const comment = template ? template.content.textContent : '';

        document.getElementById('feedbackDetailName').textContent = trigger.getAttribute('data-name') || 'Anonymous';

        const email = trigger.getAttribute('data-email') || '';
        const emailEl = document.getElementById('feedbackDetailEmail');
        emailEl.replaceChildren();
        if (email) {
            const link = document.createElement('a');
            link.href = 'mailto:' + email;
            link.className = 'fb-inbox__email';
            link.textContent = email;
            emailEl.appendChild(link);
        } else {
            emailEl.textContent = '—';
        }

        document.getElementById('feedbackDetailContact').textContent = trigger.getAttribute('data-contact') || '—';
        document.getElementById('feedbackDetailSubmitted').textContent = trigger.getAttribute('data-submitted') || '—';
        document.getElementById('feedbackDetailComment').textContent = comment;
    });
});
</script>
@endpush
