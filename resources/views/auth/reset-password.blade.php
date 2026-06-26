@extends('layouts.auth')

@section('title', 'Choose new password')

@section('content')
    <div class="auth-page__hero">
        <h1>Set a new password</h1>
        <p>Choose a strong password for your account. You will sign in with it on the next screen.</p>
    </div>

    <form method="POST" action="{{ route('password.store') }}" novalidate>
        @csrf

        <input type="hidden" name="token" value="{{ $request->route('library.token') }}">

        <div class="auth-page__field">
            <label for="email">Email address</label>
            <input type="email"
                   name="email"
                   id="email"
                   class="form-control @error('email') is-invalid @enderror"
                   value="{{ old('email', $request->email) }}"
                   required
                   autofocus
                   autocomplete="username">
            @error('email')
                <div class="invalid-feedback d-block">{{ $message }}</div>
            @enderror
        </div>

        <div class="auth-page__field">
            <label for="password">New password</label>
            <input type="password"
                   name="password"
                   id="password"
                   class="form-control @error('password') is-invalid @enderror"
                   required
                   autocomplete="new-password">
            @error('password')
                <div class="invalid-feedback d-block">{{ $message }}</div>
            @enderror
        </div>

        <div class="auth-page__field">
            <label for="password_confirmation">Confirm password</label>
            <input type="password"
                   name="password_confirmation"
                   id="password_confirmation"
                   class="form-control"
                   required
                   autocomplete="new-password">
        </div>

        <button type="submit" class="auth-page__btn auth-page__btn--primary">Update password</button>
    </form>

    <a href="{{ route('login') }}" class="auth-page__btn auth-page__btn--outline">← Back to sign in</a>
@endsection
