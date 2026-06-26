<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Sign in') — {{ config('app.name', 'Library') }}</title>
    <link href="{{ asset('vendor/bootstrap/css/bootstrap.min.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset(config('branding.css_path')) }}">
    <link rel="stylesheet" href="{{ asset('css/brand-typography.css') }}">
    <link rel="stylesheet" href="{{ asset('css/auth/page.css') }}">
    @stack('styles')
</head>
<body class="auth-page">
    <div class="auth-page__shell">
        <div class="auth-page__top">
       
            <a href="{{ url('/') }}" class="auth-page__home-link">← Home</a>
        </div>

        <div class="auth-page__card">
            @yield('content')
        </div>

        @hasSection('footer')
            @yield('footer')
        @endif
    </div>

    @stack('scripts')
</body>
</html>
