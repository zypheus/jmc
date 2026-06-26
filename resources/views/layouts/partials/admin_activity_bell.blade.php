@auth
@can('isAdminOrStaff')
@php
    $notifSince = auth()->user()->notification_last_seen_at;
    $notifUnread = \App\Models\AdminActivity::query()
        ->patronNotifications()
        ->when($notifSince, fn ($q) => $q->where('created_at', '>', $notifSince))
        ->count();
    $notifRecent = \App\Models\AdminActivity::query()
        ->patronNotifications()
        ->latest()
        ->limit(8)
        ->get();
@endphp
<div class="admin-notif-wrap dropdown">
    <button type="button"
            class="admin-notif-bell btn btn-link p-0 border-0"
            id="adminNotifDropdown"
            data-bs-toggle="dropdown"
            data-bs-auto-close="outside"
            aria-expanded="false"
            aria-label="Patron notifications">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
        </svg>
        <span class="admin-notif-badge {{ $notifUnread > 0 ? '' : 'd-none' }}" id="adminNotifBadge">{{ $notifUnread > 99 ? '99+' : $notifUnread }}</span>
    </button>
    <div class="dropdown-menu dropdown-menu-end admin-notif-menu shadow" aria-labelledby="adminNotifDropdown">
        <div class="admin-notif-menu__head d-flex justify-content-between align-items-center">
            <strong>Notifications</strong>
            <button type="button" class="btn btn-link btn-sm p-0 admin-notif-mark-read" id="adminNotifMarkRead">Mark all read</button>
        </div>
        <div class="admin-notif-menu__list" id="adminNotifList">
            @forelse($notifRecent as $activity)
                @php $isUnread = ! $notifSince || $activity->created_at->gt($notifSince); @endphp
                <a href="{{ $activity->action_url ?: route('library.admin.activities.index') }}"
                   class="admin-notif-item {{ $isUnread ? 'is-unread' : '' }}">
                    <span class="admin-notif-item__title">{{ $activity->title }}</span>
                    @if($activity->body)
                        <span class="admin-notif-item__body">{{ $activity->body }}</span>
                    @endif
                    <span class="admin-notif-item__time">{{ $activity->created_at?->timezone('Asia/Manila')->diffForHumans() }}</span>
                </a>
            @empty
                <p class="admin-notif-empty text-muted small mb-0">No patron notifications yet.</p>
            @endforelse
        </div>
        <div class="admin-notif-menu__foot">
            <a href="{{ route('library.admin.activities.index') }}" class="small">View activity log →</a>
        </div>
    </div>
</div>
@endcan
@endauth
