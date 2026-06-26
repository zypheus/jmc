@extends('layouts.sec')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/patrons/directory.css') }}">
@endsection

@section('content')
<div class="patron-dir">
    <header class="patron-dir__hero">
        <div>
            <p class="patron-dir__eyebrow">Patron data</p>
            <h1 class="patron-dir__title">Register student</h1>
            <p class="patron-dir__subtitle">Add a student patron to the library directory. A QR code is assigned automatically.</p>
        </div>
        <div class="patron-dir__hero-actions">
            <a href="{{ route('library.students.index') }}" class="patron-dir__btn patron-dir__btn--outline">← Student directory</a>
        </div>
    </header>

    @include('patrons.partials.type_tabs', ['active' => 'students'])

    @if(session('success'))
        <div class="alert alert-success patron-dir__alert">{{ session('success') }}</div>
    @endif

    @if ($errors->any())
        <div class="alert alert-danger patron-dir__alert">
            <strong>Please fix the following:</strong>
            <ul class="mb-0 mt-2">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="patron-dir__form-card">
        <form id="studentForm" class="patron-dir__form" action="{{ route('library.students.store') }}" method="POST" enctype="multipart/form-data">
            @csrf

            <section class="patron-dir__form-section">
                <h2 class="patron-dir__form-section-title">Identity</h2>
                <p class="patron-dir__form-section-desc">Legal name and school ID as they should appear on the patron record.</p>
                <div class="row g-3">
                    <div class="col-md-4">
                        <label for="firstname" class="form-label">First name <span class="required">*</span></label>
                        <input type="text" name="firstname" id="firstname" class="form-control"
                               value="{{ old('firstname') }}" required autocomplete="given-name">
                    </div>
                    <div class="col-md-4">
                        <label for="lastname" class="form-label">Last name <span class="required">*</span></label>
                        <input type="text" name="lastname" id="lastname" class="form-control"
                               value="{{ old('lastname') }}" required autocomplete="family-name">
                    </div>
                    <div class="col-md-4">
                        <label for="middle_initial" class="form-label">Middle initial</label>
                        @include('partials.middle_initial_input', ['value' => old('middle_initial'), 'id' => 'middle_initial'])
                    </div>
                    <div class="col-md-6">
                        <label for="id_number" class="form-label">ID number <span class="required">*</span></label>
                        <input type="text" name="id_number" id="id_number" class="form-control"
                               value="{{ old('id_number') }}" required>
                    </div>
                    <div class="col-md-6">
                        <label for="birthday" class="form-label">Birthday</label>
                        <input type="date" name="birthday" id="birthday" class="form-control"
                               value="{{ old('birthday') }}">
                    </div>
                </div>
            </section>

            <section class="patron-dir__form-section">
                <h2 class="patron-dir__form-section-title">Academic</h2>
                <p class="patron-dir__form-section-desc">Program and year level for circulation and reporting.</p>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="course" class="form-label">Program <span class="required">*</span></label>
                        <select name="course" id="course" class="form-select" required>
                            <option value="">Select program</option>
                            @foreach($programs as $program)
                                <option value="{{ $program->program_code }}" @selected(old('course') == $program->program_code)>
                                    {{ $program->program_name }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="year" class="form-label">Year level <span class="required">*</span></label>
                        <select name="year" id="year" class="form-select" required>
                            <option value="">Select year</option>
                            @foreach(['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'] as $yr)
                                <option value="{{ $yr }}" @selected(old('year') == $yr)>{{ $yr }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </section>

            <section class="patron-dir__form-section">
                <h2 class="patron-dir__form-section-title">Contact</h2>
                <p class="patron-dir__form-section-desc">Optional email is used for book reservation ready alerts.</p>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="mobile_number" class="form-label">Mobile number</label>
                        <input type="text" name="mobile_number" id="mobile_number" class="form-control"
                               placeholder="09XXXXXXXXX" value="{{ old('mobile_number') }}" inputmode="tel">
                    </div>
                    <div class="col-md-6">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" name="email" id="email" class="form-control"
                               placeholder="name@school.edu" value="{{ old('email') }}" autocomplete="email">
                    </div>
                    <div class="col-12">
                        <label for="address" class="form-label">Address</label>
                        <textarea name="address" id="address" class="form-control" rows="2"
                                  placeholder="Complete address">{{ old('address') }}</textarea>
                    </div>
                </div>
            </section>

            <section class="patron-dir__form-section">
                <h2 class="patron-dir__form-section-title">Photo &amp; signature</h2>
                <p class="patron-dir__form-section-desc">Used on ID cards and the patron profile.</p>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="profile_picture" class="form-label">Profile photo</label>
                        <input type="file" name="profile_picture" id="profile_picture" class="form-control"
                               accept=".jpg,.jpeg,.png,image/jpeg,image/png">
                        <p class="patron-dir__form-hint">JPG or PNG, max 4 MB.</p>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Signature</label>
                        <div class="patron-dir__signature-wrap">
                            <canvas id="studentSignaturePad" width="520" height="150"></canvas>
                        </div>
                        <input type="hidden" name="student_signature" id="studentSignatureInput" value="{{ old('student_signature') }}">
                        <div class="mt-2">
                            <button type="button" id="clearStudentSignature" class="patron-dir__btn patron-dir__btn--outline patron-dir__btn--sm">
                                Clear signature
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="patron-dir__form-section">
                <h2 class="patron-dir__form-section-title">Emergency contact</h2>
                <p class="patron-dir__form-section-desc">Person to reach in case of emergency.</p>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="emergency_person" class="form-label">Contact person</label>
                        <input type="text" name="emergency_person" id="emergency_person" class="form-control"
                               value="{{ old('emergency_person') }}">
                    </div>
                    <div class="col-md-6">
                        <label for="emergency_relationship" class="form-label">Relationship</label>
                        <input type="text" name="emergency_relationship" id="emergency_relationship" class="form-control"
                               placeholder="e.g. Parent, Guardian" value="{{ old('emergency_relationship') }}">
                    </div>
                    <div class="col-md-6">
                        <label for="emergency_number" class="form-label">Contact number</label>
                        <input type="text" name="emergency_number" id="emergency_number" class="form-control"
                               placeholder="09XXXXXXXXX" value="{{ old('emergency_number') }}" inputmode="tel">
                    </div>
                    <div class="col-md-6">
                        <label for="emergency_address" class="form-label">Address</label>
                        <textarea name="emergency_address" id="emergency_address" class="form-control" rows="2"
                                  placeholder="Emergency contact address">{{ old('emergency_address') }}</textarea>
                    </div>
                </div>
            </section>

            <div class="patron-dir__form-actions">
                <a href="{{ route('library.students.index') }}" class="patron-dir__btn patron-dir__btn--outline">Cancel</a>
                <button type="submit" class="patron-dir__btn patron-dir__btn--primary">Register student</button>
            </div>
        </form>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('vendor/signature_pad/signature_pad.umd.min.js') }}"></script>
<script>
    (function () {
        const canvas = document.getElementById('studentSignaturePad');
        const input = document.getElementById('studentSignatureInput');
        if (!canvas || !window.SignaturePad) return;

        const signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
        });

        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const width = canvas.parentElement.clientWidth;
            const height = 150;
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            const data = signaturePad.isEmpty() ? null : signaturePad.toData();
            signaturePad.clear();
            if (data) signaturePad.fromData(data);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        document.getElementById('clearStudentSignature')?.addEventListener('click', () => {
            signaturePad.clear();
            input.value = '';
        });

        document.getElementById('studentForm')?.addEventListener('submit', () => {
            input.value = signaturePad.isEmpty() ? '' : signaturePad.toDataURL();
        });
    })();
</script>
@endsection
