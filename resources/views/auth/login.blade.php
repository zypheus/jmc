@extends('layouts.auth')

@section('title', 'Sign in')

@section('content')
    @if(file_exists(public_path('images/d.png')))
        <div class="auth-page__logo-wrap">
            <img src="{{ asset('images/d.png') }}" alt="{{ config('app.name') }}" class="auth-page__logo">
        </div>
    @endif

    <div class="auth-page__hero">
        <h1>Welcome back</h1>
        </div>

    @if(session('status'))
        <div class="alert alert-success auth-page__alert">{{ session('status') }}</div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger auth-page__alert">{{ session('error') }}</div>
    @endif

    <form method="POST" action="{{ route('login') }}" novalidate>
        @csrf

        <div class="auth-page__field">
            <label for="email">Email</label>
            <input type="email"
                   name="email"
                   id="email"
                   class="form-control @error('email') is-invalid @enderror"
                   value="{{ old('email') }}"
                   placeholder=""
                   required
                   autofocus
                   autocomplete="username">
            @error('email')
                <div class="invalid-feedback d-block">{{ $message }}</div>
            @enderror
        </div>

        <div class="auth-page__field">
            <label for="password">Password</label>
            <input type="password"
                   name="password"
                   id="password"
                   class="form-control @error('password') is-invalid @enderror"
                   placeholder=""
                   required
                   autocomplete="current-password">
            @error('password')
                <div class="invalid-feedback d-block">{{ $message }}</div>
            @enderror
        </div>

        <div class="auth-page__row">
            <label class="auth-page__remember" for="remember">
                <input type="checkbox" name="remember" id="remember" value="1" @checked(old('remember'))>
                Remember me
            </label>
            <a href="{{ route('password.request') }}" class="auth-page__link">Forgot password?</a>
        </div>

        <button type="submit" class="auth-page__btn auth-page__btn--primary">Sign in</button>
    </form>

    <div class="auth-page__divider">Patron services</div>

    <a href="{{ route('library.register.form') }}" class="auth-page__btn auth-page__btn--outline">
        Patron self-registration
    </a>
@endsection

@section('footer')

@endsection
