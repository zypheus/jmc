<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Library registration</title>
    <link href="{{ asset('vendor/bootstrap/css/bootstrap.min.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset(config('branding.css_path')) }}">
    <link rel="stylesheet" href="{{ asset('css/brand-typography.css') }}">
    <link rel="stylesheet" href="{{ asset('css/patrons/directory.css') }}">
    <link rel="stylesheet" href="{{ asset('css/patrons/register-public.css') }}">
</head>
<body>
@php
    $defaultTab = ($errors->has('employee_id') || $errors->has('designation') || $errors->has('program') || $errors->has('year_start_work') || old('designation')) ? 'employee' : 'student';
@endphp

<div class="patron-register">
    <div class="patron-register__shell">
        <div class="patron-register__top">
            <a href="{{ url('/') }}" class="patron-register__brand">
                <p class="patron-register__brand-title">Library registration</p>
                <p class="patron-register__brand-sub">Self-service patron sign-up</p>
            </a>
            <a href="{{ url('/') }}" class="patron-register__home-link">← Back to home</a>
        </div>

        <div class="patron-register__hero">
            <h1>Register as a library patron</h1>
            <p>Submit your details for review. Library staff will approve your account before you can use patron services.</p>
        </div>

        <div class="patron-register__card">
            @if(session('success'))
                <div class="alert alert-success patron-register__alert">{{ session('success') }}</div>
            @endif
            @if(session('error'))
                <div class="alert alert-danger patron-register__alert">{{ session('error') }}</div>
            @endif
            @if ($errors->any())
                <div class="alert alert-danger patron-register__alert">
                    <strong>Please fix the following:</strong>
                    <ul class="mb-0 mt-2">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <div class="patron-register__notice" role="note">
                <span aria-hidden="true">ℹ️</span>
                <span>Your registration stays <strong>pending</strong> until a librarian approves it. You will not receive a library ID until then.</span>
            </div>

            <div class="patron-register__tabs" role="tablist" aria-label="Patron type">
                <button type="button"
                        id="tabStudent"
                        class="patron-register__tab {{ $defaultTab === 'student' ? 'is-active' : '' }}"
                        role="tab"
                        aria-selected="{{ $defaultTab === 'student' ? 'true' : 'false' }}"
                        aria-controls="panelStudent"
                        data-register-tab="student">
                    Student
                </button>
                <button type="button"
                        id="tabEmployee"
                        class="patron-register__tab patron-register__tab--staff {{ $defaultTab === 'employee' ? 'is-active is-active--staff' : '' }}"
                        role="tab"
                        aria-selected="{{ $defaultTab === 'employee' ? 'true' : 'false' }}"
                        aria-controls="panelEmployee"
                        data-register-tab="employee">
                    Faculty &amp; staff
                </button>
            </div>

            <div id="panelStudent"
                 class="patron-register__panel {{ $defaultTab === 'student' ? 'is-active' : '' }}"
                 role="tabpanel"
                 aria-labelledby="tabStudent">
                <form id="studentForm" class="patron-dir__form" method="POST" action="{{ route('library.register.student.store') }}" enctype="multipart/form-data">
                    @csrf
                    @include('pending.partials.register_student_fields')
                </form>
            </div>

            <div id="panelEmployee"
                 class="patron-register__panel {{ $defaultTab === 'employee' ? 'is-active' : '' }}"
                 role="tabpanel"
                 aria-labelledby="tabEmployee">
                <form id="employeeForm" class="patron-dir__form" method="POST" action="{{ route('library.register.employee.store') }}" enctype="multipart/form-data">
                    @csrf
                    @include('pending.partials.register_employee_fields')
                </form>
            </div>
        </div>
    </div>
</div>

<script src="{{ asset('vendor/signature_pad/signature_pad.umd.min.js') }}"></script>
<script>
(function () {
    const tabs = document.querySelectorAll('[data-register-tab]');
    const panels = {
        student: document.getElementById('panelStudent'),
        employee: document.getElementById('panelEmployee'),
    };

    function setupSignaturePad(canvasId, inputId, clearBtnId) {
        const canvas = document.getElementById(canvasId);
        const input = document.getElementById(inputId);
        if (!canvas || !window.SignaturePad) return null;

        const pad = new SignaturePad(canvas, { backgroundColor: 'rgb(255, 255, 255)' });

        function resize() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const width = canvas.parentElement.clientWidth;
            const height = 150;
            const data = pad.isEmpty() ? null : pad.toData();
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            pad.clear();
            if (data) pad.fromData(data);
        }

        resize();
        window.addEventListener('resize', resize);

        document.getElementById(clearBtnId)?.addEventListener('click', () => {
            pad.clear();
            input.value = '';
        });

        canvas.closest('form')?.addEventListener('submit', () => {
            input.value = pad.isEmpty() ? '' : pad.toDataURL();
        });

        return { resize };
    }

    const studentPad = setupSignaturePad('studentSignaturePad', 'studentSignatureInput', 'clearStudentSignature');
    const employeePad = setupSignaturePad('employeeSignaturePad', 'employeeSignatureInput', 'clearEmployeeSignature');

    function showTab(which) {
        tabs.forEach((tab) => {
            const active = tab.getAttribute('data-register-tab') === which;
            tab.classList.toggle('is-active', active);
            tab.classList.toggle('is-active--staff', active && which === 'employee');
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        Object.entries(panels).forEach(([name, panel]) => {
            panel?.classList.toggle('is-active', name === which);
        });

        setTimeout(() => (which === 'student' ? studentPad : employeePad)?.resize?.(), 50);
    }

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => showTab(tab.getAttribute('data-register-tab')));
    });
})();
</script>
</body>
</html>
