@auth
@php $authUser = auth()->user(); @endphp
<div class="user-menu-wrap dropdown">
    <button type="button"
            class="user-menu-toggle"
            id="userMenuDropdown"
            data-bs-toggle="dropdown"
            data-bs-auto-close="true"
            aria-expanded="false"
            aria-label="Account menu">
        @if($authUser->profilePictureUrl())
            <img src="{{ $authUser->profilePictureUrl() }}" alt="" class="user-menu-avatar">
        @else
            <span class="user-menu-avatar user-menu-avatar--initials">{{ $authUser->initials() }}</span>
        @endif
    </button>
    <div class="dropdown-menu dropdown-menu-end user-menu-dropdown shadow" aria-labelledby="userMenuDropdown">
        <div class="user-menu-dropdown__head">
            <span class="user-menu-dropdown__name">{{ $authUser->fullName() }}</span>
            <span class="user-menu-dropdown__meta">{{ $authUser->email }}</span>
        </div>
        <a href="{{ route('library.account.edit') }}" class="user-menu-dropdown__item">My account</a>
        <hr class="user-menu-dropdown__divider">
        <form action="{{ route('logout') }}" method="POST" class="mb-0">
            @csrf
            <button type="submit" class="user-menu-dropdown__item user-menu-dropdown__item--danger">Logout</button>
        </form>
    </div>
</div>
@endauth
