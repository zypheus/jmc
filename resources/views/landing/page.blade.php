<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/x-icon" href="{{ asset('images/pantasLogo.png') }}">
    <title>PANTAS | Platform</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.0.0/dist/tabler-icons.min.css" />
    <link rel="stylesheet" href="{{ asset('css/style_landing.css') }}">

</head>
<body>
    <header>
        <div class="logo-container">
            <a href="{{ url('/') }}" aria-label="PANTAS home">
                <img src="{{ asset('images/Pantas logo landscape.png') }}" alt="PANTAS Logo" class="logo">
            </a>
        </div>

        <nav class="nav-links" aria-label="Primary navigation">
            <ul>
                <li><a href="#about">ABOUT</a></li>
                <li><a href="/opac">OPAC</a></li>
                <li><a href="https://zendy.io/" target="_blank" rel="noopener noreferrer">ZENDY</a></li>
                <li><a href="#contact">CONTACT US</a></li>
                <li><a href="{{ url('/rooms/book') }}">ROOM RESERVATIONS</a></li>
                <li><a href="{{ route('library.feedback.create') }}" class="feedback-link">FEEDBACK</a></li>
                <li><button onclick="openLoginModal()" class="login-button" style="border:none;font-size:0.82rem;font-weight:700;letter-spacing:0;cursor:pointer;">LOGIN</button></li>
            </ul>
        </nav>
    </header>

    @if(session('status') || session('success') || session('error'))
        <div class="landing-flash {{ session('error') ? 'is-error' : 'is-success' }}" role="status">
            {{ session('error') ?? session('success') ?? session('status') }}
        </div>
    @endif

    <main class="hero">
        <div class="hero-content">
            <h1 class="fade-in">WELCOME TO PANTAS</h1>
        </div>
    </main>

    <section id="about" class="about-section fade-in-scroll">
        <div class="container">
            <img src="{{ asset('images/pantasLogo2.png') }}" alt="PANTAS Logo Large" class="about-logo">
            <h2 class="tagline">"Pinoy Automated Next-Generation Technology for Academic Services"</h2>
            <p class="description">
                PANTAS (Affiliated by AREA51) is a smart digital library system designed to revolutionize how libraries operate. It bridges traditional physical resources with modern digital management using advanced RFID technology. As AREA 51's first start-up venture, PANTAS aims to build the libraries of tomorrow - offering intelligent solutions that improve efficiency, enhance security, and simplify daily operations for librarians, educators, and institutions.
            </p>
            <h3 class="footer-motto">"Your Partner in Building the Libraries of Tomorrow"</h3>
        </div>
    </section>

    <footer id="contact">
        <div class="footer-container">
            <div class="footer-col branding">
                <img src="{{ asset('images/Pantas logo landscape.png') }}" alt="PANTAS Logo" class="footer-logo">
                <img src="{{ asset('images/Area 51 new logo 2 copy.png') }}" alt="Area 51 Logo" class="footer-logo-sub">
                <p class="copyright">PANTAS &copy; 2025. All Rights Reserved.</p>
            </div>
            <div class="footer-col">
                <h3>QUICK LINKS</h3>
                <ul>
                    <li><a href="{{ url('/') }}">HOME</a></li>
                    <li><a href="#about">ABOUT</a></li>
                    <li><a href="#contact">CONTACT US</a></li>
                    <li><a href="{{ url('/rooms/book') }}">ROOM RESERVATIONS</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>GET IN TOUCH</h3>
                <p>Zamoras Bldg, 2nd Floor, Purok 4, Glodo Subd,<br>
                   San Francisco, Panabo City, Davao del Norte</p>
                <p class="schedule">MONDAY - FRIDAY<br>9:00 AM - 5:00 PM</p>
                <p><a href="mailto:inquiry@area51.ph">inquiry@area51.ph</a></p>
                <p>0917 762 1021</p>
            </div>
        </div>
    </footer>

    <!-- ========= LOGIN MODAL ========= -->
    <div class="lm-overlay" id="lmOverlay" onclick="handleOverlayClick(event)">
        <div class="lm-card-wrap">

            <button class="lm-close" onclick="closeLoginModal()" title="Close">
                <i class="ti ti-x"></i>
            </button>

            <div class="lm-card">

                <!-- LEFT BRAND PANEL -->
                <aside class="lm-left" id="lmLeft">
                    <div class="lm-waves"><span></span><span></span><span></span></div>
                    <div class="lm-left-top" id="lmLeftTop">Welcome to</div>
                    <div class="lm-badge lib" id="lmBadge"><img src="{{ asset('images/djmc.png') }}" alt="Jose Maria College seal"></div>
                    <div class="lm-brandname" id="lmBrandName">JMC Portal</div>
                    <p class="lm-blurb" id="lmBlurb">Sign in to access the Library and Attendance systems of Jose Maria College.</p>
                    <div class="lm-left-links">
                        <a onclick="lmGo(1)">Register</a>
                        <span class="lm-dot">|</span>
                        <a href="/opac">DISCOVER MORE</a>
                    </div>
                </aside>

                <!-- RIGHT SIDE -->
                <div class="lm-right">
                    <div class="lm-views" id="lmViews">

                        <!-- ===== LOGIN ===== -->
                        <section class="lm-view">
                            <h2>Sign in to your account</h2>

                            @if(session('status'))
                                <div class="lm-flash-success">{{ session('status') }}</div>
                            @endif
                            @if(session('error'))
                                <div class="lm-flash-error">{{ session('error') }}</div>
                            @endif

                            <form method="POST" action="{{ route('login') }}">
                                @csrf

                                <label for="lm_email">Email <span class="lm-req">*</span></label>
                                <input class="lm-input lm-mb" type="email" id="lm_email" name="email"
                                       placeholder="staff@jmc.edu.ph"
                                       value="{{ old('email') }}"
                                       autocomplete="username" required autofocus />
                                @error('email')
                                    <div class="lm-err">{{ $message }}</div>
                                @enderror

                                <label for="lm_password" style="margin-top:16px">Password <span class="lm-req">*</span></label>
                                <input class="lm-input" type="password" id="lm_password" name="password"
                                       placeholder="Enter password"
                                       autocomplete="current-password" required />
                                @error('password')
                                    <div class="lm-err">{{ $message }}</div>
                                @enderror

                                <label class="lm-remember">
                                    <input type="checkbox" name="remember" value="1" @checked(old('remember'))>
                                    Remember me
                                </label>

                                <button type="submit" class="lm-btn lib">Sign In</button>
                            </form>

                            <button class="lm-swap" onclick="lmGo(1)">Register</button>
                        </section>

                        <!-- ===== REGISTER ===== -->
                        <section class="lm-view">
                            <div class="lm-reg-head">
                                <h2>Register</h2>
                                <button class="lm-back" onclick="lmGo(0)"><i class="ti ti-arrow-left"></i> Login</button>
                            </div>

                            <div class="lm-service" id="lmService">
                                <span class="lm-pill"></span>
                                <button id="lmSv0" class="sv-active" onclick="lmSetService(0)"><i class="ti ti-calendar-check"></i> Attendance</button>
                                <button id="lmSv1" onclick="lmSetService(1)"><i class="ti ti-books"></i> Library</button>
                            </div>

                            <div class="lm-svc-window" id="lmSvcWindow">
                                <div class="lm-svc-track" id="lmSvcTrack">

                                    <!-- ATTENDANCE -->
                                    <div class="lm-svc lm-att-form">
                                        <div class="lm-roles">
                                            <button class="lm-role on-att" id="lmAttStudent" onclick="lmAttRole('student')">Student</button>
                                            <button class="lm-role" id="lmAttEmployee" onclick="lmAttRole('employee')">Employee</button>
                                        </div>

                                        <!-- Attendance Student -->
                                        <div id="lmAttStudentForm">
                                            <form method="POST" action="{{ route('attendance.register.student.store') }}" enctype="multipart/form-data">
                                                @csrf
                                                <input type="hidden" name="student_signature" id="lmSigAttStudent">

                                                <div class="lm-section-title att">Student Information</div>
                                                <div class="lm-grid2">
                                                    <input class="lm-input" name="firstname" placeholder="First Name" value="{{ old('firstname') }}" />
                                                    <input class="lm-input" name="middle_initial" placeholder="Middle Initial" value="{{ old('middle_initial') }}" />
                                                    <input class="lm-input" name="lastname" placeholder="Last Name" value="{{ old('lastname') }}" />
                                                    <input class="lm-input" name="student_id" placeholder="Student ID" value="{{ old('student_id') }}" />
                                                    <input class="lm-input" name="birth_date" type="date" value="{{ old('birth_date') }}" />
                                                    <input class="lm-input" name="mobile_number" placeholder="Mobile Number" value="{{ old('mobile_number') }}" />
                                                    <select class="lm-input" name="course">
                                                        <option value="">Course</option>
                                                        <option @selected(old('course')=='BSCS')>BSCS</option>
                                                        <option @selected(old('course')=='BSIT')>BSIT</option>
                                                        <option @selected(old('course')=='BSED')>BSED</option>
                                                        <option @selected(old('course')=='BSA')>BSA</option>
                                                    </select>
                                                    <input class="lm-input" name="year" placeholder="Year / Section" value="{{ old('year') }}" />
                                                    <input class="lm-input" name="emergency_person" placeholder="Emergency Contact Name" value="{{ old('emergency_person') }}" />
                                                    <input class="lm-input" name="emergency_relationship" placeholder="Relationship" value="{{ old('emergency_relationship') }}" />
                                                    <input class="lm-input" name="emergency_number" placeholder="Contact Number" value="{{ old('emergency_number') }}" />
                                                    <input class="lm-input" name="address" placeholder="Address" value="{{ old('address') }}" />
                                                </div>
                                                <div style="margin-top:14px">
                                                    <label>Profile Picture</label>
                                                    <div class="lm-note">Please upload a <b>1×1 ID picture</b> with a <b>plain white background</b>.</div>
                                                    <div class="lm-file">
                                                        <label>Choose File<input type="file" name="profile_picture" accept="image/*" onchange="lmUpdateFile(this)"></label>
                                                        <span>No file chosen</span>
                                                    </div>
                                                </div>
                                                <label style="margin-top:14px">Signature (draw below)</label>
                                                <canvas class="lm-sig-pad" id="lmCanvasAttStudent"></canvas>
                                                <button type="button" class="lm-sig-clear" onclick="lmClearSig('lmCanvasAttStudent','lmSigAttStudent')">Clear</button>
                                                <div class="lm-submit-wrap">
                                                    <button type="submit" class="lm-btn att">Submit Student Registration</button>
                                                </div>
                                            </form>
                                        </div>

                                        <!-- Attendance Employee -->
                                        <div id="lmAttEmployeeForm" style="display:none">
                                            <form method="POST" action="{{ route('attendance.register.employee.store') }}" enctype="multipart/form-data">
                                                @csrf
                                                <input type="hidden" name="employee_signature" id="lmSigAttEmployee">

                                                <div class="lm-section-title att">Employee Information</div>
                                                <div class="lm-grid2">
                                                    <input class="lm-input" name="firstname" placeholder="First Name" value="{{ old('firstname') }}" />
                                                    <input class="lm-input" name="lastname" placeholder="Last Name" value="{{ old('lastname') }}" />
                                                    <input class="lm-input" name="department" placeholder="Department" value="{{ old('department') }}" />
                                                    <input class="lm-input" name="position" placeholder="Position" value="{{ old('position') }}" />
                                                    <input class="lm-input" name="employee_id" placeholder="Employee ID" value="{{ old('employee_id') }}" />
                                                    <input class="lm-input" name="birth_date" type="date" value="{{ old('birth_date') }}" />
                                                    <select class="lm-input" name="sex">
                                                        <option value="">Select Sex</option>
                                                        <option @selected(old('sex')=='Male')>Male</option>
                                                        <option @selected(old('sex')=='Female')>Female</option>
                                                    </select>
                                                    <input class="lm-input" name="tin_id_number" placeholder="TIN ID Number" value="{{ old('tin_id_number') }}" />
                                                    <input class="lm-input" name="philhealth_number" placeholder="PhilHealth Number" value="{{ old('philhealth_number') }}" />
                                                    <input class="lm-input" name="sss_number" placeholder="SSS Number" value="{{ old('sss_number') }}" />
                                                    <input class="lm-input" name="hdmf_number" placeholder="HDMF Number" value="{{ old('hdmf_number') }}" />
                                                    <input class="lm-input" name="blood_type" placeholder="Blood Type" value="{{ old('blood_type') }}" />
                                                    <input class="lm-input" name="civil_status" placeholder="Civil Status" value="{{ old('civil_status') }}" />
                                                    <input class="lm-input" name="emergency_contact_name" placeholder="Emergency Contact Name" value="{{ old('emergency_contact_name') }}" />
                                                    <input class="lm-input" name="emergency_contact_relationship" placeholder="Relationship" value="{{ old('emergency_contact_relationship') }}" />
                                                    <input class="lm-input" name="emergency_contact_number" placeholder="Contact Number" value="{{ old('emergency_contact_number') }}" />
                                                </div>
                                                <div style="margin-top:14px">
                                                    <label>Formal Picture</label>
                                                    <div class="lm-file">
                                                        <label>Choose File<input type="file" name="formal_picture" accept="image/*" onchange="lmUpdateFile(this)"></label>
                                                        <span>No file chosen</span>
                                                    </div>
                                                </div>
                                                <div style="margin-top:14px">
                                                    <label>Address</label>
                                                    <textarea class="lm-input" name="address" placeholder="Home Address">{{ old('address') }}</textarea>
                                                </div>
                                                <label style="margin-top:14px">Signature (draw below)</label>
                                                <canvas class="lm-sig-pad" id="lmCanvasAttEmployee"></canvas>
                                                <button type="button" class="lm-sig-clear" onclick="lmClearSig('lmCanvasAttEmployee','lmSigAttEmployee')">Clear</button>
                                                <div class="lm-submit-wrap">
                                                    <button type="submit" class="lm-btn att">Submit Employee Registration</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                    <!-- LIBRARY -->
                                    <div class="lm-svc">
                                        <div class="lm-pending"><i class="ti ti-info-circle"></i><span>Your registration stays <b>pending</b> until a librarian approves it. You will not receive a library ID until then.</span></div>
                                        <div class="lm-roles">
                                            <button class="lm-role on-lib" id="lmLibStudent" onclick="lmLibRole('student')">Student</button>
                                            <button class="lm-role" id="lmLibFaculty" onclick="lmLibRole('faculty')">Faculty &amp; staff</button>
                                        </div>

                                        <!-- Library Student -->
                                        <div id="lmLibStudentForm">
                                            <form method="POST" action="{{ route('library.register.student.store') }}" enctype="multipart/form-data">
                                                @csrf
                                                <input type="hidden" name="student_signature" id="lmSigLibStudent">

                                                <div class="lm-section-title lib">Identity</div>
                                                <p class="lm-hint" style="margin:-6px 0 12px">Your name and school ID as they appear on our records.</p>
                                                <div class="lm-grid2">
                                                    <div><label>First name <span class="lm-req">*</span></label><input class="lm-input" name="firstname" value="{{ old('firstname') }}" required /></div>
                                                    <div><label>Last name <span class="lm-req">*</span></label><input class="lm-input" name="lastname" value="{{ old('lastname') }}" required /></div>
                                                    <div class="lm-full"><label>Middle initial</label><input class="lm-input" name="middle_initial" placeholder="M.I." value="{{ old('middle_initial') }}" /></div>
                                                    <div><label>ID number <span class="lm-req">*</span></label><input class="lm-input" name="id_number" value="{{ old('id_number') }}" required /></div>
                                                    <div><label>Birthday</label><input class="lm-input" name="birthday" type="date" value="{{ old('birthday') }}" /></div>
                                                </div>
                                                <div class="lm-sub-divider">Academic</div>
                                                <div class="lm-grid2">
                                                    <div>
                                                        <label>Program <span class="lm-req">*</span></label>
                                                        <select class="lm-input" name="course">
                                                            <option value="">Select program</option>
                                                            <option @selected(old('course')=='BSCS')>BSCS</option>
                                                            <option @selected(old('course')=='BSIT')>BSIT</option>
                                                            <option @selected(old('course')=='BSED')>BSED</option>
                                                            <option @selected(old('course')=='BSA')>BSA</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label>Year level <span class="lm-req">*</span></label>
                                                        <select class="lm-input" name="year">
                                                            <option value="">Select year</option>
                                                            <option @selected(old('year')=='1st')>1st</option>
                                                            <option @selected(old('year')=='2nd')>2nd</option>
                                                            <option @selected(old('year')=='3rd')>3rd</option>
                                                            <option @selected(old('year')=='4th')>4th</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="lm-sub-divider">Contact</div>
                                                <div class="lm-grid2">
                                                    <div><label>Mobile number</label><input class="lm-input" name="mobile_number" placeholder="09XXXXXXXXX" value="{{ old('mobile_number') }}" /></div>
                                                    <div><label>Email</label><input class="lm-input" name="email" type="email" placeholder="For reservation alerts" value="{{ old('email') }}" /></div>
                                                    <div class="lm-full"><label>Address</label><input class="lm-input" name="address" value="{{ old('address') }}" /></div>
                                                </div>
                                                <div class="lm-sub-divider">Emergency contact</div>
                                                <div class="lm-grid2">
                                                    <div><label>Contact person</label><input class="lm-input" name="emergency_person" value="{{ old('emergency_person') }}" /></div>
                                                    <div><label>Relationship</label><input class="lm-input" name="emergency_relationship" value="{{ old('emergency_relationship') }}" /></div>
                                                    <div><label>Contact number</label><input class="lm-input" name="emergency_number" value="{{ old('emergency_number') }}" /></div>
                                                    <div><label>Address</label><input class="lm-input" name="emergency_address" value="{{ old('emergency_address') }}" /></div>
                                                </div>
                                                <div class="lm-sub-divider">Photo &amp; signature</div>
                                                <label>Profile photo</label>
                                                <div class="lm-file">
                                                    <label>Choose File<input type="file" name="profile_picture" accept="image/*" onchange="lmUpdateFile(this)"></label>
                                                    <span>No file chosen</span>
                                                </div>
                                                <p class="lm-hint">JPG or PNG, max 4 MB.</p>
                                                <label style="margin-top:12px">Signature</label>
                                                <canvas class="lm-sig-pad" id="lmCanvasLibStudent"></canvas>
                                                <button type="button" class="lm-sig-clear" onclick="lmClearSig('lmCanvasLibStudent','lmSigLibStudent')">Clear signature</button>
                                                <div class="lm-submit-wrap">
                                                    <button type="submit" class="lm-btn lib">Submit student registration</button>
                                                </div>
                                            </form>
                                        </div>

                                        <!-- Library Faculty -->
                                        <div id="lmLibFacultyForm" style="display:none">
                                            <form method="POST" action="{{ route('library.register.employee.store') }}" enctype="multipart/form-data">
                                                @csrf
                                                <input type="hidden" name="employee_signature" id="lmSigLibFaculty">

                                                <div class="lm-section-title lib">Identity</div>
                                                <div class="lm-grid2">
                                                    <div><label>First name <span class="lm-req">*</span></label><input class="lm-input" name="firstname" value="{{ old('firstname') }}" required /></div>
                                                    <div><label>Last name <span class="lm-req">*</span></label><input class="lm-input" name="lastname" value="{{ old('lastname') }}" required /></div>
                                                    <div class="lm-full"><label>Middle initial</label><input class="lm-input" name="middle_initial" placeholder="M.I." value="{{ old('middle_initial') }}" /></div>
                                                    <div><label>ID number <span class="lm-req">*</span></label><input class="lm-input" name="employee_id" value="{{ old('employee_id') }}" required /></div>
                                                    <div><label>Designation <span class="lm-req">*</span></label><input class="lm-input" name="designation" placeholder="e.g. Instructor I, Librarian" value="{{ old('designation') }}" required /></div>
                                                </div>
                                                <div class="lm-sub-divider">Employment</div>
                                                <div class="lm-grid2">
                                                    <div>
                                                        <label>Program <span class="lm-req">*</span></label>
                                                        <select class="lm-input" name="program">
                                                            <option value="">Select program</option>
                                                            <option @selected(old('program')=='CICT')>CICT</option>
                                                            <option @selected(old('program')=='CAS')>CAS</option>
                                                            <option @selected(old('program')=='Library')>Library</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label>Year started <span class="lm-req">*</span></label>
                                                        <select class="lm-input" name="year_start_work">
                                                            <option value="">Select year</option>
                                                            @foreach(range(date('Y'), 2000) as $yr)
                                                                <option @selected(old('year_start_work')==$yr)>{{ $yr }}</option>
                                                            @endforeach
                                                        </select>
                                                    </div>
                                                    <div><label>Birthday</label><input class="lm-input" name="birth_date" type="date" value="{{ old('birth_date') }}" /></div>
                                                    <div><label>Mobile number</label><input class="lm-input" name="mobile_number" placeholder="09XXXXXXXXX" value="{{ old('mobile_number') }}" /></div>
                                                    <div class="lm-full"><label>Address</label><textarea class="lm-input" name="address">{{ old('address') }}</textarea></div>
                                                </div>
                                                <div class="lm-sub-divider">Photo &amp; signature</div>
                                                <label>Formal photo</label>
                                                <div class="lm-file">
                                                    <label>Choose File<input type="file" name="formal_picture" accept="image/*" onchange="lmUpdateFile(this)"></label>
                                                    <span>No file chosen</span>
                                                </div>
                                                <p class="lm-hint">Optional. JPG or PNG, max 4 MB.</p>
                                                <label style="margin-top:12px">Signature</label>
                                                <canvas class="lm-sig-pad" id="lmCanvasLibFaculty"></canvas>
                                                <button type="button" class="lm-sig-clear" onclick="lmClearSig('lmCanvasLibFaculty','lmSigLibFaculty')">Clear signature</button>
                                                <div class="lm-sub-divider">Emergency contact</div>
                                                <div class="lm-grid2">
                                                    <div><label>Contact person</label><input class="lm-input" name="emergency_contact_name" value="{{ old('emergency_contact_name') }}" /></div>
                                                    <div><label>Relationship</label><input class="lm-input" name="emergency_contact_relationship" value="{{ old('emergency_contact_relationship') }}" /></div>
                                                    <div><label>Contact number</label><input class="lm-input" name="emergency_contact_number" value="{{ old('emergency_contact_number') }}" /></div>
                                                    <div><label>Address</label><input class="lm-input" name="emergency_address" value="{{ old('emergency_address') }}" /></div>
                                                </div>
                                                <div class="lm-submit-wrap">
                                                    <button type="submit" class="lm-btn lib">Submit faculty &amp; staff registration</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                </div><!-- /lm-svc-track -->
                            </div><!-- /lm-svc-window -->
                        </section>

                    </div><!-- /lm-views -->
                </div><!-- /lm-right -->
            </div><!-- /lm-card -->
        </div><!-- /lm-card-wrap -->
    </div><!-- /lm-overlay -->

    <script>
        /* ── Modal open / close ── */
        const lmOverlay = document.getElementById('lmOverlay');

        function openLoginModal(){
            lmOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            setTimeout(() => lmInitAllCanvases(), 60);
        }
        function closeLoginModal(){
            lmOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
        function handleOverlayClick(e){
            if(e.target === lmOverlay) closeLoginModal();
        }
        document.addEventListener('keydown', e => { if(e.key === 'Escape') closeLoginModal(); });

        /* ── Brand panel state ── */
        const LM_COPY = {
            login:{ top:'Welcome to', icon:'ti-school', logo:'{{ asset('images/djmc.png') }}', cls:'lib', name:'JMC Portal',
                    text:'Sign in to access the Library and Attendance systems of Jose Maria College.', att:false },
            att:  { top:'Register for', icon:'ti-calendar-check', logo:'{{ asset('images/djmc.png') }}', cls:'att', name:'JMC Attendance',
                    text:'Create your attendance record. Students and employees can log daily time once registered.', att:true },
            lib:  { top:'Register for', icon:'ti-books', logo:'{{ asset('images/djmc.png') }}', cls:'lib', name:'JMC Library',
                    text:'Apply for borrowing access. A librarian reviews each request before your library ID is issued.', att:false }
        };
        let lmPage=0, lmSvc=0;

        function lmPaint(c){
            document.getElementById('lmLeftTop').textContent   = c.top;
            const b = document.getElementById('lmBadge');
            b.className = 'lm-badge ' + c.cls;
            b.innerHTML = c.logo
                ? '<img src="' + c.logo + '" alt="Jose Maria College seal">'
                : '<i class="ti ' + c.icon + '"></i>';
            document.getElementById('lmBrandName').textContent = c.name;
            document.getElementById('lmBlurb').textContent     = c.text;
            document.getElementById('lmLeft').classList.toggle('att-mode', c.att);
        }
        function lmGo(p){
            lmPage = p;
            document.getElementById('lmViews').style.transform = 'translateX(-' + (p*50) + '%)';
            lmPaint(p===0 ? LM_COPY.login : (lmSvc===0 ? LM_COPY.att : LM_COPY.lib));
        }
        function lmSetService(i){
            lmSvc = i;
            document.getElementById('lmSvcTrack').style.transform = 'translateX(-' + (i*50) + '%)';
            document.getElementById('lmService').classList.toggle('lib-mode', i===1);
            document.getElementById('lmSv0').classList.toggle('sv-active', i===0);
            document.getElementById('lmSv1').classList.toggle('sv-active', i===1);
            lmPaint(i===0 ? LM_COPY.att : LM_COPY.lib);
        }
        function lmAttRole(r){
            const s = r==='student';
            document.getElementById('lmAttStudentForm').style.display  = s ? 'block' : 'none';
            document.getElementById('lmAttEmployeeForm').style.display = s ? 'none'  : 'block';
            document.getElementById('lmAttStudent').classList.toggle('on-att',  s);
            document.getElementById('lmAttEmployee').classList.toggle('on-att', !s);
        }
        function lmLibRole(r){
            const s = r==='student';
            document.getElementById('lmLibStudentForm').style.display  = s ? 'block' : 'none';
            document.getElementById('lmLibFacultyForm').style.display  = s ? 'none'  : 'block';
            document.getElementById('lmLibStudent').classList.toggle('on-lib',  s);
            document.getElementById('lmLibFaculty').classList.toggle('on-lib', !s);
        }

        /* ── Touch swipe on service tabs ── */
        let lmSx=null, lmSy=null;
        document.getElementById('lmSvcWindow').addEventListener('touchstart', e=>{ lmSx=e.touches[0].clientX; lmSy=e.touches[0].clientY; },{passive:true});
        document.getElementById('lmSvcWindow').addEventListener('touchend',   e=>{
            if(lmSx===null) return;
            const dx=e.changedTouches[0].clientX-lmSx, dy=e.changedTouches[0].clientY-lmSy;
            if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)){
                if(dx<0 && lmSvc===0) lmSetService(1);
                else if(dx>0 && lmSvc===1) lmSetService(0);
            }
            lmSx=lmSy=null;
        });

        /* ── File name display ── */
        function lmUpdateFile(input){
            input.closest('.lm-file').querySelector('span').textContent =
                input.files.length ? input.files[0].name : 'No file chosen';
        }

        /* ── Signature canvases ── */
        const LM_CANVASES = [
            { canvas:'lmCanvasAttStudent',  hidden:'lmSigAttStudent'  },
            { canvas:'lmCanvasAttEmployee', hidden:'lmSigAttEmployee' },
            { canvas:'lmCanvasLibStudent',  hidden:'lmSigLibStudent'  },
            { canvas:'lmCanvasLibFaculty',  hidden:'lmSigLibFaculty'  },
        ];

        function lmInitCanvas(id){
            const canvas = document.getElementById(id);
            if(!canvas || canvas.dataset.ready) return;
            const ratio = window.devicePixelRatio || 1;
            const r     = canvas.getBoundingClientRect();
            if(r.width === 0) return;
            canvas.width  = r.width  * ratio;
            canvas.height = r.height * ratio;
            const ctx = canvas.getContext('2d');
            ctx.scale(ratio, ratio);
            ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=2; ctx.strokeStyle='#1f2937';
            canvas.dataset.ready = '1';
        }
        function lmInitAllCanvases(){ LM_CANVASES.forEach(c => lmInitCanvas(c.canvas)); }

        function lmClearSig(canvasId, hiddenId){
            const canvas = document.getElementById(canvasId);
            canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
            document.getElementById(hiddenId).value = '';
        }

        LM_CANVASES.forEach(({ canvas: cId, hidden: hId }) => {
            const canvas = document.getElementById(cId);
            if(!canvas) return;
            const ctx = canvas.getContext('2d');
            let drawing = false;
            const pos = e => {
                const r=canvas.getBoundingClientRect(), t=e.touches?e.touches[0]:e;
                return { x:t.clientX-r.left, y:t.clientY-r.top };
            };
            const start = e=>{ lmInitCanvas(cId); drawing=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); e.preventDefault(); };
            const move  = e=>{ if(!drawing) return; const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); e.preventDefault(); };
            const end   = ()=>{ drawing=false; document.getElementById(hId).value=canvas.toDataURL(); };
            canvas.addEventListener('mousedown',  start);
            canvas.addEventListener('mousemove',  move);
            window.addEventListener('mouseup',    end);
            canvas.addEventListener('touchstart', start, {passive:false});
            canvas.addEventListener('touchmove',  move,  {passive:false});
            canvas.addEventListener('touchend',   end);
        });

        lmPaint(LM_COPY.login);

        @if($openLoginModal ?? false)
            openLoginModal();
        @endif

        /* ── Auto-open if server returned errors ── */
        @if($errors->any())
            openLoginModal();
            @if($errors->any() && !$errors->has('email') && !$errors->has('password'))
                lmGo(1);
            @endif
        @endif
    </script>
</body>
</html>
