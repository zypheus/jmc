@extends('layouts.auth')

@section('title', 'Forgot password')

@section('content')
    <div class="auth-page__hero">
        <h1>Reset your password</h1>
        <p>Enter the email on your staff account. We will send a secure link to choose a new password.</p>
    </div>

    @if(session('status'))
        <div class="alert alert-success auth-page__alert">{{ session('status') }}</div>
    @endif

    <form method="POST" action="{{ route('password.email') }}" novalidate>
        @csrf

        <div class="auth-page__field">
            <label for="email">Email address</label>
            <input type="email"
                   name="email"
                   id="email"
                   class="form-control @error('email') is-invalid @enderror"
                   value="{{ old('email') }}"
                   placeholder="you@school.edu"
                   required
                   autofocus
                   autocomplete="username">
            @error('email')
                <div class="invalid-feedback d-block">{{ $message }}</div>
            @enderror
        </div>

        <button type="submit" class="auth-page__btn auth-page__btn--primary">Email reset link</button>
    </form>

    <a href="{{ route('login') }}" class="auth-page__btn auth-page__btn--outline">← Back to sign in</a>
@endsection
