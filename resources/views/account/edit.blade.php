@extends('layouts.sec')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/account.css') }}">
@endsection

@section('content')
<div class="account-page">
    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <header class="account-page__head mb-4">
        <h1 class="h3 mb-1">My account</h1>
        <p class="text-muted mb-0">Update your profile, photo, and password.</p>
    </header>

    <div class="row g-4">
        <div class="col-lg-5">
            <div class="card account-card">
                <div class="card-body">
                    <h2 class="h6 account-card__title">Profile photo</h2>
                    <div class="account-avatar-preview mb-3">
                        @if($user->profilePictureUrl())
                            <img src="{{ $user->profilePictureUrl() }}" alt="" class="account-avatar-preview__img" id="accountAvatarPreview">
                        @else
                            <span class="account-avatar-preview__initials" id="accountAvatarPreview">{{ $user->initials() }}</span>
                        @endif
                    </div>
                    <p class="text-muted small mb-0">{{ $user->fullName() }} · {{ ucfirst($user->role) }}</p>
                </div>
            </div>
        </div>

        <div class="col-lg-7">
            <div class="card account-card mb-4">
                <div class="card-body">
                    <h2 class="h6 account-card__title">Profile details</h2>
                    <form method="POST" action="{{ route('library.account.profile.update') }}" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')

                        <div class="row g-3">
                            <div class="col-md-6">
                                <label for="fname" class="form-label">First name</label>
                                <input type="text" name="fname" id="fname" class="form-control" value="{{ old('fname', $user->fname) }}" required>
                            </div>
                            <div class="col-md-6">
                                <label for="lname" class="form-label">Last name</label>
                                <input type="text" name="lname" id="lname" class="form-control" value="{{ old('lname', $user->lname) }}" required>
                            </div>
                            <div class="col-12">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" name="email" id="email" class="form-control" value="{{ old('email', $user->email) }}" required>
                            </div>
                            <div class="col-12">
                                <label for="profile_picture" class="form-label">Profile picture</label>
                                <input type="file" name="profile_picture" id="profile_picture" class="form-control" accept="image/jpeg,image/png,image/webp">
                                <div class="form-text">JPG, PNG, or WebP. Max 4 MB.</div>
                            </div>
                            @if($user->profile_picture)
                                <div class="col-12">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="remove_profile_picture" value="1" id="remove_profile_picture">
                                        <label class="form-check-label" for="remove_profile_picture">Remove current photo</label>
                                    </div>
                                </div>
                            @endif
                        </div>

                        <button type="submit" class="btn btn-primary mt-3">Save profile</button>
                    </form>
                </div>
            </div>

            <div class="card account-card">
                <div class="card-body">
                    <h2 class="h6 account-card__title">Change password</h2>
                    <form method="POST" action="{{ route('library.account.password.update') }}">
                        @csrf
                        @method('PUT')

                        <div class="mb-3">
                            <label for="current_password" class="form-label">Current password</label>
                            <input type="password" name="current_password" id="current_password" class="form-control" required autocomplete="current-password">
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">New password</label>
                            <input type="password" name="password" id="password" class="form-control" required autocomplete="new-password">
                        </div>
                        <div class="mb-3">
                            <label for="password_confirmation" class="form-label">Confirm new password</label>
                            <input type="password" name="password_confirmation" id="password_confirmation" class="form-control" required autocomplete="new-password">
                        </div>

                        <button type="submit" class="btn btn-outline-primary">Update password</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
document.getElementById('profile_picture')?.addEventListener('change', function (e) {
    const file = e.target.files?.[0];
    const preview = document.getElementById('accountAvatarPreview');
    if (!file || !preview) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
        if (preview.tagName === 'IMG') {
            preview.src = ev.target.result;
        } else {
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.alt = '';
            img.className = 'account-avatar-preview__img';
            img.id = 'accountAvatarPreview';
            preview.replaceWith(img);
        }
    };
    reader.readAsDataURL(file);
});
</script>
@endsection
