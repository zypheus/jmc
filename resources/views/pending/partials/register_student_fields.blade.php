<section class="patron-dir__form-section">
    <h2 class="patron-dir__form-section-title">Identity</h2>
    <p class="patron-dir__form-section-desc">Your name and school ID as they appear on your records.</p>
    <div class="row g-3">
        <div class="col-md-4">
            <label for="student_firstname" class="form-label">First name <span class="required">*</span></label>
            <input type="text" name="firstname" id="student_firstname" class="form-control"
                   value="{{ old('firstname') }}" required autocomplete="given-name">
        </div>
        <div class="col-md-4">
            <label for="student_lastname" class="form-label">Last name <span class="required">*</span></label>
            <input type="text" name="lastname" id="student_lastname" class="form-control"
                   value="{{ old('lastname') }}" required autocomplete="family-name">
        </div>
        <div class="col-md-4">
            <label for="student_mi" class="form-label">Middle initial</label>
            @include('partials.middle_initial_input', ['value' => old('middle_initial'), 'id' => 'student_mi'])
        </div>
        <div class="col-md-6">
            <label for="student_id_number" class="form-label">ID number <span class="required">*</span></label>
            <input type="text" name="id_number" id="student_id_number" class="form-control"
                   value="{{ old('id_number') }}" required>
        </div>
        <div class="col-md-6">
            <label for="student_birthday" class="form-label">Birthday</label>
            <input type="date" name="birthday" id="student_birthday" class="form-control"
                   value="{{ old('birthday') }}">
        </div>
    </div>
</section>

<section class="patron-dir__form-section">
    <h2 class="patron-dir__form-section-title">Academic</h2>
    <div class="row g-3">
        <div class="col-md-6">
            <label for="student_course" class="form-label">Program <span class="required">*</span></label>
            <select name="course" id="student_course" class="form-select" required>
                <option value="">Select program</option>
                @foreach($programs as $program)
                    <option value="{{ $program->program_code }}" @selected(old('course') == $program->program_code)>
                        {{ $program->program_name }}
                    </option>
                @endforeach
            </select>
        </div>
        <div class="col-md-6">
            <label for="student_year" class="form-label">Year level <span class="required">*</span></label>
            <select name="year" id="student_year" class="form-select" required>
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
    <div class="row g-3">
        <div class="col-md-6">
            <label for="student_mobile" class="form-label">Mobile number</label>
            <input type="text" name="mobile_number" id="student_mobile" class="form-control"
                   placeholder="09XXXXXXXXX" value="{{ old('mobile_number') }}" inputmode="tel">
        </div>
        <div class="col-md-6">
            <label for="student_email" class="form-label">Email</label>
            <input type="email" name="email" id="student_email" class="form-control"
                   placeholder="For reservation alerts" value="{{ old('email') }}" autocomplete="email">
        </div>
        <div class="col-12">
            <label for="student_address" class="form-label">Address</label>
            <input type="text" name="address" id="student_address" class="form-control"
                   value="{{ old('address') }}">
        </div>
    </div>
</section>

<section class="patron-dir__form-section">
    <h2 class="patron-dir__form-section-title">Emergency contact</h2>
    <div class="row g-3">
        <div class="col-md-6">
            <label for="student_emergency_person" class="form-label">Contact person</label>
            <input type="text" name="emergency_person" id="student_emergency_person" class="form-control"
                   value="{{ old('emergency_person') }}">
        </div>
        <div class="col-md-6">
            <label for="student_emergency_relationship" class="form-label">Relationship</label>
            <input type="text" name="emergency_relationship" id="student_emergency_relationship" class="form-control"
                   value="{{ old('emergency_relationship') }}">
        </div>
        <div class="col-md-6">
            <label for="student_emergency_number" class="form-label">Contact number</label>
            <input type="text" name="emergency_number" id="student_emergency_number" class="form-control"
                   value="{{ old('emergency_number') }}" inputmode="tel">
        </div>
        <div class="col-md-6">
            <label for="student_emergency_address" class="form-label">Address</label>
            <input type="text" name="emergency_address" id="student_emergency_address" class="form-control"
                   value="{{ old('emergency_address') }}">
        </div>
    </div>
</section>

<section class="patron-dir__form-section">
    <h2 class="patron-dir__form-section-title">Photo &amp; signature</h2>
    <div class="row g-3">
        <div class="col-md-6">
            <label for="student_profile_picture" class="form-label">Profile photo</label>
            <input type="file" name="profile_picture" id="student_profile_picture" class="form-control"
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

<button type="submit" class="patron-register__submit patron-register__submit--student">
    Submit student registration
</button>
