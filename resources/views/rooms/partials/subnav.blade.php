@php
    $pendingCount = \App\Models\RoomReservation::where('status', 'pending')->count();
@endphp
<nav class="rooms-subnav" aria-label="Room reservations">
    <a href="{{ route('library.rooms.index') }}"
       class="rooms-subnav__link {{ request()->routeIs('library.rooms.index', 'rooms.create', 'rooms.edit') ? 'active' : '' }}">
        Manage rooms
    </a>
    <a href="{{ route('library.rooms.book') }}"
       class="rooms-subnav__link {{ request()->routeIs('library.rooms.book') ? 'active' : '' }}"
       @if(!auth()->check()) target="_blank" rel="noopener" @endif>
        Book a room
    </a>
    <a href="{{ route('library.rooms.schedule') }}"
       class="rooms-subnav__link {{ request()->routeIs('library.rooms.schedule', 'rooms.show') ? 'active' : '' }}">
        View schedule
    </a>
    <a href="{{ route('library.rooms.pending') }}"
       class="rooms-subnav__link {{ request()->routeIs('library.rooms.pending') ? 'active' : '' }}">
        Pending requests
        @if($pendingCount > 0)
            <span class="rooms-subnav__badge">{{ $pendingCount }}</span>
        @endif
    </a>
    <a href="{{ route('library.rooms.logs') }}"
       class="rooms-subnav__link {{ request()->routeIs('library.rooms.logs') ? 'active' : '' }}">
        Reservation logs
    </a>
</nav>
