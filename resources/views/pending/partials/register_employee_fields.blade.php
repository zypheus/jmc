<section class="patron-dir__form-section">
    <h2 class="patron-dir__form-section-title">Identity</h2>
    <div class="row g-3">
        <div class="col-md-4">
            <label for="employee_firstname" class="form-label">First name <span class="required">*</span></label>
            <input type="text" name="firstname" id="employee_firstname" class="form-control"
                   value="{{ old('firstname') }}" required autocomplete="given-name">
        </div>
        <div class="col-md-4">
            <label for="employee_lastname" class="form-label">Last name <span class="required">*</span></label>
            <input type="text" name="lastname" id="employee_lastname" class="form-control"
                   value="{{ old('lastname') }}" required autocomplete="family-name">
        </div>
        <div class="col-md-4">
            <label for="employee_mi" class="form-label">Middle initial</label>
            @include('partials.middle_initial_input', ['value' => old('middle_initial'), 'id' => 'employee_mi'])
        </div>
        <div class="col-md-6">
            <label for="employee_id" class="form-label">ID number <span class="required">*</span></label>
            <input type="text" name="employee_id" id="employee_id" class="form-control"
                   value="{{ old('employee_id') }}" required>
        </div>
        <div class="col-md-6">
            <label for="employee_designation" class="form-label">Designation <span class="required">*</span></label>
            <input type="text" name="designation" id="employee_designation" class="form-control"
                   placeholder="e.g. Instructor I, Librarian" value="{{ old('designation') }}" required>
        </div>
    </div>
</section>

<section class="patron-dir__form-section">
    <h2 class="patron-dir__form-section-title">Employment</h2>
    <div class="row g-3">
        <div class="col-md-6">
            <label for="employee_program" class="form-label">Program <span class="required">*</span></label>
            <select name="program" id="employee_program" class="form-select" required>
                <option value="">Select program</option>
                @foreach ($programs as $program)
                    <option value="{{ $program->program_code }}" @selected(old('program') === $program->program_code)>
                        {{ $program->program_name }}
                    </option>
                @endforeach
            </select>
        </div>
        <div class="col-md-6">
            <label for="employee_year_start" class="form-label">Year started at this HEI <span class="required">*</span></label>
            <select name="year_start_work" id="employee_year_start" class="form-select" required>
                <option value="">Select year</option>
                @foreach ($workStartYears as $yr)
                    <option value="{{ $yr }}" @selected(old('year_start_work') == (string) $yr)>{{ $yr }}</option>
                @endforeach
            </select>
        </div>
        <div class="col-md-6">
            <label for="employee_birth_date" class="form-label">Birthday</label>
            <input type="date" name="birth_date" id="employee_birth_date" class="form-control"
                   value="{{ old('birth_date') }}">
        </div>
        <div class="col-md-6">
            <label for="employee_mobile" class="form-label">Mobile number</label>
            <input type="text" name="mobile_number" id="employee_mobile" class="form-control"
                   placeholder="09XXXXXXXXX" value="{{ old('mobile_number') }}" inputmode="tel">
        </div>
        <div class="col-12">
            <label for="employee_address" class="form-label">Address</label>
            <textarea name="address" id="employee_address" class="form-control" rows="2">{{ old('address') }}</textarea>
        </div>
    </div>
</section>

<section class="patron-dir__form-section">
    <h2 class="patron-dir__form-section-title">Photo &amp; signature</h2>
    <div class="row g-3">
        <div class="col-md-6">
            <label for="employee_formal_picture" class="form-label">Formal photo</label>
            <input type="file" name="formal_picture" id="employee_formal_picture" class="form-control"
                   accept=".jpg,.jpeg,.png,image/jpeg,image/png">
            <p class="patron-dir__form-hint">Optional. JPG or PNG, max 4 MB.</p>
        </div>
        <div class="col-12">
            <label class="form-label">Signature</label>
            <div class="patron-dir__signature-wrap">
                <canvas id="employeeSignaturePad" width="520" height="150"></canvas>
            </div>
            <input type="hidden" name="employee_signature" id="employeeSignatureInput" value="{{ old('employee_signature') }}">
            <div class="mt-2">
                <button type="button" id="clearEmployeeSignature" class="patron-dir__btn patron-dir__btn--outline patron-dir__btn--sm">
                    Clear signature
                </button>
            </div>
        </div>
    </div>
</section>

<section class="patron-dir__form-section">
    <h2 class="patron-dir__form-section-title">Emergency contact</h2>
    <div class="row g-3">
        <div class="col-md-6">
            <label for="employee_emergency_name" class="form-label">Contact person</label>
            <input type="text" name="emergency_contact_name" id="employee_emergency_name" class="form-control"
                   value="{{ old('emergency_contact_name') }}">
        </div>
        <div class="col-md-6">
            <label for="employee_emergency_relationship" class="form-label">Relationship</label>
            <input type="text" name="emergency_contact_relationship" id="employee_emergency_relationship" class="form-control"
                   value="{{ old('emergency_contact_relationship') }}">
        </div>
        <div class="col-md-6">
            <label for="employee_emergency_number" class="form-label">Contact number</label>
            <input type="text" name="emergency_contact_number" id="employee_emergency_number" class="form-control"
                   value="{{ old('emergency_contact_number') }}" inputmode="tel">
        </div>
        <div class="col-md-6">
            <label for="employee_emergency_address" class="form-label">Address</label>
            <input type="text" name="emergency_address" id="employee_emergency_address" class="form-control"
                   value="{{ old('emergency_address') }}">
        </div>
    </div>
</section>

<button type="submit" class="patron-register__submit patron-register__submit--staff">
    Submit faculty &amp; staff registration
</button>
