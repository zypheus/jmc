(function () {
    let pendingResolve = null;

    function loanTermsModal() {
        return document.getElementById('loanTermsModal');
    }

    function hideLoanTermsModal() {
        const modal = loanTermsModal();
        if (!modal) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }

    function resetLoanTermsForm() {
        const defaultRadio = document.getElementById('loanTermsDefault');
        const dueInput = document.getElementById('loanTermsDueDate');
        const daysInput = document.getElementById('loanTermsLoanDays');
        const panel = document.getElementById('loanTermsCustomPanel');

        if (defaultRadio) defaultRadio.checked = true;
        if (dueInput) dueInput.value = '';
        if (daysInput) daysInput.value = '';
        if (panel) panel.classList.add('d-none');
    }

    function toggleCustomPanel() {
        const customRadio = document.getElementById('loanTermsCustom');
        const panel = document.getElementById('loanTermsCustomPanel');
        if (panel && customRadio) {
            panel.classList.toggle('d-none', !customRadio.checked);
        }
    }

    function bindLoanTermsModalOnce() {
        const modal = loanTermsModal();
        if (!modal || modal.dataset.bound === '1') return;
        modal.dataset.bound = '1';

        document.getElementById('loanTermsDefault')?.addEventListener('change', toggleCustomPanel);
        document.getElementById('loanTermsCustom')?.addEventListener('change', toggleCustomPanel);

        document.getElementById('loanTermsConfirmBtn')?.addEventListener('click', function () {
            const customRadio = document.getElementById('loanTermsCustom');
            const result = {};

            if (customRadio?.checked) {
                const due = document.getElementById('loanTermsDueDate')?.value?.trim();
                const daysRaw = document.getElementById('loanTermsLoanDays')?.value?.trim();
                const days = daysRaw ? parseInt(daysRaw, 10) : 0;

                if (due) {
                    result.due_date = due;
                } else if (days > 0) {
                    result.loan_duration_days = days;
                } else {
                    alert('Enter a due date or number of loan days.');
                    return;
                }
            }

            hideLoanTermsModal();
            if (pendingResolve) {
                const resolve = pendingResolve;
                pendingResolve = null;
                resolve(result);
            }
        });

        document.getElementById('loanTermsCancelBtn')?.addEventListener('click', function () {
            hideLoanTermsModal();
            pendingResolve = null;
        });

        document.getElementById('loanTermsModalClose')?.addEventListener('click', function () {
            hideLoanTermsModal();
            pendingResolve = null;
        });
    }

    window.initLoanTermsModal = function (defaultDays, options) {
        options = options || {};
        if (typeof defaultDays === 'object' && defaultDays !== null) {
            window.LOAN_DEFAULT_DAYS_STUDENT = defaultDays.student || 7;
            window.LOAN_DEFAULT_DAYS_EMPLOYEE = defaultDays.employee || 7;
        } else {
            window.LOAN_DEFAULT_DAYS = defaultDays || 7;
            window.LOAN_DEFAULT_DAYS_STUDENT = options.student || window.LOAN_DEFAULT_DAYS;
            window.LOAN_DEFAULT_DAYS_EMPLOYEE = options.employee || window.LOAN_DEFAULT_DAYS;
        }
        bindLoanTermsModalOnce();
    };

    window.promptLoanTerms = function (defaultDays) {
        bindLoanTermsModalOnce();
        const modal = loanTermsModal();
        if (!modal) {
            return Promise.resolve({});
        }

        resetLoanTermsForm();

        const label = document.getElementById('loanTermsDefaultDays');
        if (label) {
            label.textContent = String(defaultDays || window.LOAN_DEFAULT_DAYS_STUDENT || window.LOAN_DEFAULT_DAYS || 7);
        }

        return new Promise(function (resolve) {
            pendingResolve = resolve;
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof window.LOAN_DEFAULT_DAYS_STUDENT !== 'undefined' || typeof window.LOAN_DEFAULT_DAYS_EMPLOYEE !== 'undefined') {
            initLoanTermsModal({
                student: window.LOAN_DEFAULT_DAYS_STUDENT || 7,
                employee: window.LOAN_DEFAULT_DAYS_EMPLOYEE || 7,
            });
        } else if (typeof window.LOAN_DEFAULT_DAYS !== 'undefined') {
            initLoanTermsModal(window.LOAN_DEFAULT_DAYS);
        } else {
            bindLoanTermsModalOnce();
        }
    });
})();
