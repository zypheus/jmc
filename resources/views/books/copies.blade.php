<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Book Copies</title>

    <link href="{{ asset('vendor/bootstrap/css/bootstrap.min.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/books/landing.css') }}">
    <link rel="stylesheet" href="{{ asset('css/books/index.css') }}">
    <script src="{{ asset('vendor/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('vendor/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
</head>

<body>

<div class="container mt-4">

    <div class="d-flex flex-wrap gap-2 mb-3">
        <a href="{{ route('library.landing') }}" class="btn btn-primary">← Back to OPAC</a>
        <a href="{{ url()->previous() }}" class="btn btn-outline-secondary">Previous page</a>
    </div>

    <h3>
        Copies of: <strong>{{ $title }}</strong><br>
        <small>{{ $author }} — {{ $year }}</small>
    </h3>
    <p class="text-muted small mb-0">Add a specific copy to your cart, then use <strong>Back to OPAC</strong> to browse and check out everything together (cart is saved in this browser).</p>

    <table class="table table-bordered table-striped mt-3">
        <thead>
            <tr>
                <th>Accession No</th>
                <th>Barcode</th>
                <th>RFID</th>
                <th>Availability</th>
                <th>Date Added</th>
                <th>Actions</th>
            </tr>
        </thead>

        <tbody>
            @foreach($copies as $copy)
            <tr>
                <td>{{ $copy->accession_no }}</td>
                <td>{{ $copy->barcode }}</td>
                <td>{{ $copy->rfid }}</td>

                <td class="{{ $copy->availability === 'Available' ? 'text-success' : 'text-danger' }}">
                    {{ $copy->availability }}
                </td>

                <td>{{ $copy->created_at?->format('Y-m-d') }}</td>

                <td>
                    @php $patronHold = $copy->activeBookReservation(); @endphp
                    @if($copy->isReserved())
                        <span class="text-warning fw-semibold">Room use only</span>
                    @elseif($patronHold)
                        <span class="opac-patron-reserved fw-semibold">Reserved</span>
                    @elseif($copy->availability === 'On Hold')
                        <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            onclick="openStudentCheckout({{ $copy->id }})">
                            Self Check-Out
                        </button>
                        <span class="opac-patron-reserved fw-semibold ms-1">On hold</span>
                    @elseif($copy->availability === 'Available')
                        <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            onclick="openStudentCheckout({{ $copy->id }})">
                            Self Check-Out
                        </button>
                        <button
                            type="button"
                            class="btn btn-dark btn-sm btn-add-copy-to-cart"
                            data-copy-id="{{ $copy->id }}"
                            data-title="{{ e($copy->title_statement) }}"
                            data-author="{{ e($author) }}">
                            Add to Cart
                        </button>
                        <button
                            type="button"
                            class="btn btn-outline-warning btn-sm btn-reserve-copy"
                            data-copy-id="{{ $copy->id }}">
                            Reserve
                        </button>
                    @elseif($copy->availability === 'Borrowed')
                        <button
                            type="button"
                            class="btn btn-outline-warning btn-sm btn-reserve-copy"
                            data-copy-id="{{ $copy->id }}">
                            Reserve
                        </button>
                    @else
                        <span class="text-danger">Not Available</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @include('layouts.partials.pagination_bar', ['paginator' => $copies])

</div>

<div class="modal fade" id="studentReserveModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow-lg">
            <div class="modal-header">
                <h5 class="modal-title">Reserve copy</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="reserveCopyId" value="">
                <label class="form-label">Student ID</label>
                <input type="text" id="reserveStudentId" class="form-control">
                <div id="reserveError" class="text-danger mt-2 d-none"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-warning" onclick="confirmCopyReserve()">
                    Confirm reservation
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="studentCheckoutModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow-lg">

            <div class="modal-header">
                <h5 class="modal-title">Self Check-Out</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <input type="hidden" id="selectedCopyId" value="">

                <label class="form-label">Student ID</label>
                <input type="text" id="copyStudentId" class="form-control">

                <div id="copyError" class="text-danger mt-2 d-none"></div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-primary" onclick="confirmCopyCheckout()">
                    Confirm Checkout
                </button>
            </div>

        </div>
    </div>
</div>

<div class="modal" id="cartModal">
    <div class="modal-content cart-modal-clean">
        <span class="close" onclick="closeCartModal()">&times;</span>

        <div class="cart-header">
            <h2>Borrow Cart</h2>
            <p>Maximum of 5 books allowed</p>
        </div>

        <div id="cartBody" class="cart-body">
            <ul id="cartList" class="cart-list"></ul>

            <div id="emptyCart" class="empty-cart" style="display:none;">
                Your cart is empty.
            </div>
        </div>

        <div class="cart-footer">
            <div class="cart-count">
                Total Books: <strong id="cartTotal">0</strong>
            </div>

            <button type="button" class="btn btn-dark px-5" onclick="openStudentModalFromCart()">
                Proceed to Checkout
            </button>
        </div>
    </div>
</div>

<button id="cartButton" type="button" onclick="openCartModal()"
    style="position:fixed; bottom:30px; right:30px; z-index:999;
           padding:12px 20px; border-radius:50px;"
    class="btn btn-dark">
    Cart (<span id="cartCount">0</span>)
</button>

<div class="modal" id="studentModal">
    <div class="modal-content">
        <span class="close" onclick="closeStudentModal()">&times;</span>

        <h4>Self Check-Out</h4>

        <div class="mb-3">
            <label for="studentIdInput" class="form-label"><strong>Student ID</strong></label>
            <input type="text" id="studentIdInput" class="form-control" placeholder="Enter your Student ID">
        </div>

        <button type="button" class="btn btn-primary mt-3" onclick="confirmCheckout()">
            Confirm Checkout
        </button>

        <p id="studentError" class="text-danger mt-2" style="display:none;"></p>
    </div>
</div>

<div id="toastContainer" class="toast-container"></div>

@include('partials.loan_terms_modal')

<script>
    window.CHECKOUT_URL = "{{ route('library.checkout.process') }}";
    window.RESERVE_URL = "{{ route('library.opac.reserve') }}";
    window.CSRF_TOKEN = "{{ csrf_token() }}";
    window.LOAN_DEFAULT_DAYS = @json((int) (optional(\App\Models\FineSetting::current())->studentLoanDurationDays() ?? 7));
</script>
<script src="{{ asset('js/loan-terms.js') }}"></script>
<script src="{{ asset('js/cart.js') }}"></script>
<script src="{{ asset('js/landings.js') }}"></script>
<script>
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.btn-add-copy-to-cart');
        if (btn) {
            e.preventDefault();
            var id = btn.getAttribute('data-copy-id');
            var title = btn.getAttribute('data-title') || '';
            var author = btn.getAttribute('data-author') || '';
            if (id && typeof selectBookAndAddToCart === 'function') {
                selectBookAndAddToCart(id, title, author);
            }
            return;
        }

        var reserveBtn = e.target.closest('.btn-reserve-copy');
        if (reserveBtn) {
            e.preventDefault();
            document.getElementById('reserveCopyId').value = reserveBtn.getAttribute('data-copy-id') || '';
            document.getElementById('reserveStudentId').value = '';
            document.getElementById('reserveError').classList.add('d-none');
            bootstrap.Modal.getOrCreateInstance(document.getElementById('studentReserveModal')).show();
        }
    });

    function confirmCopyReserve() {
        var copyId = document.getElementById('reserveCopyId').value;
        var studentId = document.getElementById('reserveStudentId').value.trim();
        var err = document.getElementById('reserveError');

        if (!studentId) {
            err.textContent = 'Please enter your Student ID.';
            err.classList.remove('d-none');
            return;
        }

        fetch(window.RESERVE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': window.CSRF_TOKEN,
            },
            body: JSON.stringify({ student_id: studentId, book_id: Number(copyId) }),
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (!data.success) {
                    err.textContent = data.message || 'Reservation failed.';
                    err.classList.remove('d-none');
                    return;
                }
                bootstrap.Modal.getInstance(document.getElementById('studentReserveModal'))?.hide();
                if (typeof showToast === 'function') {
                    showToast(data.message || 'Copy reserved.', 'success');
                } else {
                    alert(data.message || 'Copy reserved.');
                }
                window.location.reload();
            })
            .catch(function () {
                err.textContent = 'Server error occurred.';
                err.classList.remove('d-none');
            });
    }
</script>

</body>
</html>
