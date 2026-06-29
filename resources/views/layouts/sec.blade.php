<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'JMC Portal')</title>

    <link href="{{ asset('vendor/bootstrap/css/bootstrap.min.css') }}" rel="stylesheet" />
    <link rel="stylesheet" href="{{ asset(config('branding.css_path')) }}">
    <link rel="stylesheet" href="{{ asset('css/site-responsive.css') }}">
    <link rel="stylesheet" href="{{ asset('css/brand-typography.css') }}">

    @stack('styles')
    @yield('styles')
</head>
<body class="theme font-sans antialiased admin-page layout-dashboard">
    <div class="legacy-staff-content container-fluid py-4">
        @yield('content')
    </div>

    @yield('footer')

    <script src="{{ asset('vendor/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('vendor/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('js/data-panel.js') }}" defer></script>
    <script src="{{ asset('js/pending-tabs.js') }}" defer></script>
    @stack('scripts')
    @yield('scripts')
</body>
</html>
