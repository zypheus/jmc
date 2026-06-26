/* =========================================
   GLOBAL STATE
========================================= */

window.selectedBook = null;
window.selectedStudent = null;
window.selectedBooks = null;
window.opacDetailPayload = null;
window.studentModalMode = 'checkout';
window.pendingReserveCopyId = null;

const track = document.getElementById('carouselTrack');
let scrollAmount = 0;

function goToEBookPage() {
    window.location.href = '/opac?view=ebooks';
}

function opacBookDetailUrl(bookId) {
    const base = window.OPAC_BOOK_DETAIL_BASE || '/opac/api/book/';
    return `${base}${bookId}`;
}

function escHtml(s) {
    if (s === null || s === undefined) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
}

function setOpacTab(name) {
    document.querySelectorAll('.opac-tab').forEach((btn) => {
        const on = btn.getAttribute('data-tab') === name;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.opac-tab-panel').forEach((panel) => {
        const id = panel.id;
        const match =
            (name === 'holdings' && id === 'opacTabHoldings') ||
            (name === 'description' && id === 'opacTabDescription') ||
            (name === 'marc' && id === 'opacTabMarc');
        panel.classList.toggle('is-active', match);
    });
}

function bindOpacTabsOnce() {
    const bar = document.querySelector('.opac-tabs');
    if (!bar || bar.dataset.bound === '1') return;
    bar.dataset.bound = '1';
    bar.addEventListener('click', (e) => {
        const btn = e.target.closest('.opac-tab');
        if (!btn) return;
        setOpacTab(btn.getAttribute('data-tab'));
    });
}

function addCopyToCartFromHoldings(copyId, title, author, availability, roomUseOnly, patronHold) {
    if (roomUseOnly) {
        showToast('This copy is for room use only and cannot be added to cart.', 'error');
        return;
    }
    if (patronHold) {
        showToast('This copy is reserved for another patron.', 'error');
        return;
    }
    if (availability !== 'Available') {
        showToast('This copy is not available.', 'error');
        return;
    }
    window.selectedBook = {
        id: Number(copyId),
        title,
        author: author || '',
        availability: 'Available',
        copies: 1,
        pubYear: ''
    };
    if (typeof addToCart === 'function') addToCart();
}

function renderHoldingsTable(copies, group) {
    const tbody = document.getElementById('holdingsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const title = group?.title || '';
    const author = group?.author || '';

    copies.forEach((c) => {
        const tr = document.createElement('tr');
        tr.dataset.copyId = c.id;
        const actionsCell = buildHoldingsActionsCell(c);
        tr.innerHTML = `
            <td>${escHtml(c.accession_no ?? '—')}</td>
            <td>${escHtml(c.call_number ?? '—')}</td>
            <td>${escHtml(c.volume ?? '—')}</td>
            <td>${escHtml(c.copy_no ?? '—')}</td>
            <td>${escHtml(c.collection ?? '—')}</td>
            <td>${escHtml(c.shelving_location ?? '—')}</td>
            <td>${escHtml(c.circulation_type ?? '—')}</td>
            <td>${formatHoldingsStatus(c)}</td>
            <td>${escHtml(c.barcode ?? '—')}</td>
            <td>${escHtml(c.rfid ?? '—')}</td>
            <td>${actionsCell}</td>
        `;
        tr.querySelector('.opac-add-cart-copy')?.addEventListener('click', (e) => {
            e.stopPropagation();
            addCopyToCartFromHoldings(c.id, title, author, c.availability, c.reserved, c.patron_hold);
        });
        tr.querySelector('.opac-reserve-copy')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openStudentModalForReserve(c.id);
        });
        tr.querySelector('.opac-checkout-hold')?.addEventListener('click', (e) => {
            e.stopPropagation();
            window.studentModalMode = 'checkout';
            window.selectedBook = {
                id: Number(c.id),
                title,
                author: author || '',
                availability: c.availability,
            };
            openStudentModal();
        });
        tbody.appendChild(tr);
    });
}

function formatHoldingsStatus(copy) {
    if (copy.patron_hold) {
        const waiting = copy.patron_hold_status === 'pending' ? ' <span class="text-muted small">(waiting)</span>' : '';
        return `<span class="opac-patron-reserved">Reserved</span>${waiting}`;
    }
    return escHtml(copy.circulation_status ?? '—');
}

function buildHoldingsActionsCell(copy) {
    if (copy.reserved) {
        return '<span class="text-muted small">Room use only</span>';
    }
    if (copy.patron_hold) {
        return '<span class="opac-patron-reserved">Reserved</span>';
    }
    if (copy.availability === 'On Hold') {
        return '<div class="d-flex flex-wrap gap-1 align-items-center">'
            + '<button type="button" class="btn btn-sm btn-primary opac-checkout-hold">Self check-out</button>'
            + '<span class="opac-patron-reserved">On hold</span></div>';
    }

    const parts = [];
    if (copy.availability === 'Available') {
        parts.push('<button type="button" class="btn btn-sm btn-dark opac-add-cart-copy">Add to cart</button>');
    }
    if (copy.availability === 'Available' || copy.availability === 'Borrowed') {
        parts.push('<button type="button" class="btn btn-sm btn-outline-warning opac-reserve-copy">Reserve</button>');
    }
    if (parts.length) {
        return '<div class="d-flex flex-wrap gap-1">' + parts.join('') + '</div>';
    }
    return '<span class="text-muted small">—</span>';
}

function openStudentModalForReserve(copyId) {
    window.studentModalMode = 'reserve';
    window.pendingReserveCopyId = Number(copyId);
    openStudentModal();
}

function renderDescriptionDl(desc) {
    const dl = document.getElementById('descriptionDl');
    if (!dl) return;
    dl.innerHTML = '';

    const rows = [
        ['Item description', desc.general_note],
        ['Physical description', desc.physical_description],
        ['Bibliography', desc.bibliography],
        ['ISBN', desc.isbn],
        ['Edition', desc.edition],
        ['Published', desc.published],
        ['Series', desc.series],
        ['Subjects / topics', desc.subject_topic],
        ['Subject form', desc.subject_form],
        ['Genre', desc.genre]
    ];

    rows.forEach(([label, val]) => {
        if (val === null || val === undefined || String(val).trim() === '') return;
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = String(val);
        dl.appendChild(dt);
        dl.appendChild(dd);
    });

    if (!dl.children.length) {
        const dt = document.createElement('dt');
        dt.textContent = 'Description';
        const dd = document.createElement('dd');
        dd.textContent = 'No additional description fields are stored for this title.';
        dl.appendChild(dt);
        dl.appendChild(dd);
    }
}

function renderMarcViewTable(marcRows) {
    const tbody = document.getElementById('marcViewTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!marcRows || marcRows.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="2" class="text-muted small py-2">No MARC tags to display (empty or differ between copies — see Holdings).</td>';
        tbody.appendChild(tr);
        return;
    }

    marcRows.forEach((row) => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = row.label || '';
        const td = document.createElement('td');
        td.textContent = row.value != null ? String(row.value) : '';
        tr.appendChild(th);
        tr.appendChild(td);
        tbody.appendChild(tr);
    });
}

function renderBibSummary(desc) {
    const tb = document.getElementById('opacBibSummary');
    if (!tb) return;
    const rows = [
        ['Main author', desc.main_author],
        ['Format', desc.format],
        ['Language', desc.language],
        ['Published', desc.published],
        ['Edition', desc.edition],
        ['Subjects', desc.subject_topic]
    ];
    tb.innerHTML = '';
    rows.forEach(([k, v]) => {
        if (!v) return;
        const tr = document.createElement('tr');
        tr.innerHTML = `<th scope="row" class="small text-muted pe-2">${escHtml(k)}</th><td>${escHtml(v)}</td>`;
        tb.appendChild(tr);
    });
}

/* =========================================
   BOOK MODAL
========================================= */

function showBookModalLoading() {
    const load = document.getElementById('opacDetailLoading');
    const content = document.getElementById('opacDetailContent');
    if (load) {
        load.textContent = 'Loading record…';
        load.style.display = 'block';
    }
    if (content) content.style.display = 'none';
}

function showBookModalReady() {
    const load = document.getElementById('opacDetailLoading');
    const content = document.getElementById('opacDetailContent');
    if (load) load.style.display = 'none';
    if (content) content.style.display = 'block';
}

function openBookModalShell() {
    bindOpacTabsOnce();
    setOpacTab('description');
    const modal = document.getElementById('bookModal');
    if (modal) modal.style.display = 'flex';
    showBookModalLoading();
}

function applyOpacPayload(payload, card) {
    window.opacDetailPayload = payload;
    const coverUrl = card.dataset.img;
    const title = payload.group.title || '';
    const author = payload.group.author || '';

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalAuthor').textContent = author;

    const bc = document.getElementById('opacBreadcrumb');
    if (bc) {
        const course = card.dataset.course?.trim();
        bc.textContent = course ? course : 'Catalog';
    }

    const libLine = document.getElementById('opacHoldingsLibraryLine');
    if (libLine) {
        const libs = [...new Set((payload.copies || []).map((c) => c.shelving_location).filter(Boolean))];
        libLine.textContent = libs.length ? libs.join(' · ') : 'Holdings';
    }

    const img = document.getElementById('modalImg');
    if (img) img.src = coverUrl || '';

    renderBibSummary(payload.description || {});
    renderDescriptionDl(payload.description || {});
    renderMarcViewTable(payload.marc_view_rows || []);
    renderHoldingsTable(payload.copies || [], payload.group || {});

    showBookModalReady();
}

function openBookCard(card) {
    const bookId = card.dataset.id;
    openBookModalShell();

    fetch(opacBookDetailUrl(bookId), { headers: { Accept: 'application/json' } })
        .then((r) => {
            if (!r.ok) throw new Error('Failed to load record');
            return r.json();
        })
        .then((payload) => {
            applyOpacPayload(payload, card);
        })
        .catch((err) => {
            console.error(err);
            const load = document.getElementById('opacDetailLoading');
            if (load) {
                load.textContent = 'Unable to load this record. Please try again.';
                load.style.display = 'block';
            }
            const content = document.getElementById('opacDetailContent');
            if (content) content.style.display = 'none';
            showToast('Could not load full record.', 'error');
        });

    window.selectedBook = {
        id: bookId,
        title: card.dataset.title,
        author: card.dataset.author,
        availability: card.dataset.availability,
        copies: parseInt(card.dataset.copies, 10) || 1,
        pubYear: card.dataset.year || ''
    };
}

function closeModal() {
    const el = document.getElementById('bookModal');
    if (el) el.style.display = 'none';
}

/* =========================================
   STUDENT MODAL + CHECKOUT
========================================= */

function openStudentModal() {
    const input = document.getElementById('studentIdInput');
    const err = document.getElementById('studentError');
    const modal = document.getElementById('studentModal');
    const titleEl = document.getElementById('studentModalTitle');
    const confirmBtn = document.getElementById('studentModalConfirmBtn');
    if (!input || !modal) return;
    input.value = '';
    if (err) err.style.display = 'none';
    if (window.studentModalMode === 'reserve') {
        if (titleEl) titleEl.textContent = 'Reserve copy';
        if (confirmBtn) confirmBtn.textContent = 'Confirm reservation';
    } else {
        if (titleEl) titleEl.textContent = 'Self Check-Out';
        if (confirmBtn) confirmBtn.textContent = 'Confirm Checkout';
    }
    modal.style.display = 'flex';
}

function closeStudentModal() {
    const el = document.getElementById('studentModal');
    if (el) el.style.display = 'none';
    window.studentModalMode = 'checkout';
    window.pendingReserveCopyId = null;
}

function markBorrowedInUi(bookId) {
    document.querySelectorAll(`.book-card[data-id="${bookId}"], .carosel[data-id="${bookId}"]`).forEach((card) => {
        const statusP = card.querySelector('p.text-success, p.text-danger');
        if (statusP) {
            statusP.textContent = 'Borrowed';
            statusP.classList.remove('text-success');
            statusP.classList.add('text-danger');
        }
        card.dataset.availability = 'Borrowed';
    });

    const row = document.querySelector(`#holdingsTableBody tr[data-copy-id="${bookId}"]`);
    if (row) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 8) {
            cells[7].textContent = 'Checked out';
        }
    }
}

function runCheckoutRequest(studentId, booksToCheckout, loanTerms) {
    if (!window.CHECKOUT_URL || !window.CSRF_TOKEN) {
        showToast('Checkout is not configured.', 'error');
        return;
    }

    const payload = {
        student_id: studentId,
        books: booksToCheckout
    };
    if (loanTerms?.due_date) payload.due_date = loanTerms.due_date;
    if (loanTerms?.loan_duration_days) payload.loan_duration_days = loanTerms.loan_duration_days;

    fetch(window.CHECKOUT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': window.CSRF_TOKEN
        },
        body: JSON.stringify(payload)
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                window.selectedStudent = {
                    name: data.student.name,
                    id_number: data.student.id_number
                };

                window.selectedBooks = (data.books || []).map((b) => ({
                    id: b.id,
                    title: b.title,
                    author: b.author || '',
                    barcode: b.barcode || '',
                    due_date: b.due_date || data.due_date || ''
                }));

                if (window.selectedBooks.length === 0 && data.book) {
                    window.selectedBooks = [{
                        id: data.book.id,
                        title: data.book.title,
                        author: data.book.author || '',
                        barcode: data.book.barcode || '',
                        due_date: data.book.due_date || data.due_date || ''
                    }];
                }

                if (window.selectedBooks.length === 1) {
                    window.selectedBook = window.selectedBooks[0];
                } else {
                    window.selectedBook = null;
                }

                window.selectedBooks.forEach((book) => markBorrowedInUi(book.id));

                window.cart = [];
                localStorage.removeItem('borrowCart');
                updateCartUI();

                closeStudentModal();
                closeCartModal();

                if (typeof window.printReceiptBulk === 'function' && window.selectedBooks.length > 0) {
                    window.printReceiptBulk();
                }

                showToast('Checkout successful!', 'success');

                if (window.opacDetailPayload && window.selectedBooks.length === 1) {
                    const id = window.selectedBooks[0].id;
                    const c = window.opacDetailPayload.copies.find((x) => Number(x.id) === Number(id));
                    if (c) {
                        c.availability = 'Borrowed';
                        c.circulation_status = 'Checked out';
                    }
                }
            } else {
                showToast('Checkout failed: ' + (data.message || 'Unknown error'), 'error');
            }
        })
        .catch((err) => {
            console.error(err);
            showToast('Server error occurred.', 'error');
        });
}

function confirmCheckout() {
    if (window.studentModalMode === 'reserve') {
        confirmReserve();
        return;
    }

    const studentId = document.getElementById('studentIdInput').value.trim();

    if (!studentId) {
        showToast('Please enter your Student ID.', 'error');
        return;
    }

    let booksToCheckout = [];

    if (window.cart && window.cart.length > 0) {
        booksToCheckout = window.cart;
    } else if (window.selectedBook) {
        booksToCheckout = [window.selectedBook];
    } else {
        showToast('No book selected.', 'error');
        return;
    }

    const proceed = typeof promptLoanTerms === 'function'
        ? promptLoanTerms()
        : Promise.resolve({});

    proceed.then((loanTerms) => runCheckoutRequest(studentId, booksToCheckout, loanTerms));
}

function confirmReserve() {
    const studentId = document.getElementById('studentIdInput')?.value.trim();
    const copyId = window.pendingReserveCopyId;

    if (!studentId) {
        showToast('Please enter your Student ID.', 'error');
        return;
    }
    if (!copyId) {
        showToast('No copy selected for reservation.', 'error');
        return;
    }
    if (!window.RESERVE_URL || !window.CSRF_TOKEN) {
        showToast('Reservation is not configured.', 'error');
        return;
    }

    fetch(window.RESERVE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': window.CSRF_TOKEN,
        },
        body: JSON.stringify({
            student_id: studentId,
            book_id: copyId,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (!data.success) {
                showToast(data.message || 'Reservation failed.', 'error');
                return;
            }

            closeStudentModal();

            if (window.opacDetailPayload && Array.isArray(window.opacDetailPayload.copies)) {
                const copy = window.opacDetailPayload.copies.find((c) => Number(c.id) === Number(copyId));
                if (copy) {
                    copy.patron_hold = true;
                    copy.patron_hold_status = data.reservation?.status || 'pending';
                    if (data.reservation?.availability) {
                        copy.availability = data.reservation.availability;
                        copy.circulation_status = copy.availability === 'On Hold' ? 'On hold' : copy.circulation_status;
                    }
                    renderHoldingsTable(window.opacDetailPayload.copies, window.opacDetailPayload.group);
                }
            }

            showToast(data.message || 'Copy reserved.', 'success');
        })
        .catch((err) => {
            console.error(err);
            showToast('Server error occurred.', 'error');
        });
}

/* =========================================
   QZ TRAY PRINTING
========================================= */

if (typeof qz !== 'undefined') {
    qz.security.setCertificatePromise(function (resolve) {
        resolve('-----BEGIN CERTIFICATE-----\nYOUR CERT HERE\n-----END CERTIFICATE-----');
    });

    qz.security.setSignaturePromise(function () {
        return function (resolve) {
            resolve('SIGNATURE');
        };
    });
}

function connectQZ() {
    if (typeof qz === 'undefined') return Promise.reject(new Error('QZ Tray not loaded'));
    if (qz.websocket.isActive()) return Promise.resolve();
    return qz.websocket.connect();
}

window.printReceiptBulk = function printReceiptBulk() {
    if (!window.selectedStudent || !window.selectedBooks || window.selectedBooks.length === 0) {
        alert('No checkout data available to print.');
        return;
    }

    connectQZ().then(() => {
        const config = qz.configs.create('GLPrint');

        const now = new Date();
        const formattedDate = now.toLocaleDateString();
        const formattedTime = now.toLocaleTimeString();

        let lines = '';
        window.selectedBooks.forEach((book) => {
            lines += `${book.title}\n`;
            lines += `${book.author || ''}\n`;
            lines += `Barcode: ${book.barcode || ''}\n`;
            lines += `Due Date: ${book.due_date || ''}\n`;
            lines += '--------------------------------\n';
        });

        const data = [
            '\x1B\x40',
            '\x1B\x61\x00',
            'Kundo E. Pahm Learning Resource Center\n',
            `${formattedDate} ${formattedTime}\n`,
            '\n',
            '\n',
            `${window.selectedStudent.name.toUpperCase()}\n`,
            `${window.selectedStudent.id_number}\n`,
            '\n',
            "Today's Checkouts\n",
            '--------------------------------\n',
            lines,
            'Served By: ______________________\n',
            '\n\n\n',
            '\x1D\x56\x01'
        ];

        return qz.print(config, [{
            type: 'raw',
            format: 'command',
            data: data.join('')
        }]);
    }).catch((err) => {
        console.error('QZ Tray Error:', err);
        alert('Printing failed. Check QZ Tray.');
    });
};

/* =========================================
   CAROUSEL
========================================= */

function slide(direction) {
    if (!track) return;

    const bookWidth = 130;
    scrollAmount += direction * bookWidth * 2;

    if (scrollAmount < 0) scrollAmount = 0;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (scrollAmount > maxScroll) scrollAmount = maxScroll;

    track.style.transform = `translateX(-${scrollAmount}px)`;
}

function openStudentModalFromCart() {
    if (!window.cart || window.cart.length === 0) {
        showToast('Cart is empty.', 'error');
        return;
    }
    window.selectedBook = null;
    closeCartModal();
    openStudentModal();
}

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModal();
    closeStudentModal();
    if (typeof closeCartModal === 'function') closeCartModal();
});

document.addEventListener('DOMContentLoaded', () => {
    bindOpacTabsOnce();

    const hash = window.location.hash || '';
    const m = /^#book-(\d+)$/.exec(hash);
    if (m) {
        const id = m[1];
        const card = document.querySelector(`.book-card[data-id="${id}"], .carosel[data-id="${id}"]`);
        if (card) {
            openBookCard(card);
        }
    }
});
