@php
    $loanDefaultDaysStudent = $loanDefaultDaysStudent ?? (int) (optional(\App\Models\FineSetting::current())->studentLoanDurationDays() ?? 7);
    $loanDefaultDaysEmployee = $loanDefaultDaysEmployee ?? (int) (optional(\App\Models\FineSetting::current())->employeeLoanDurationDays() ?? 7);
@endphp

<div class="modal" id="loanTermsModal" style="display:none;" aria-hidden="true">
    <div class="modal-content" style="max-width: 440px;">
        <span class="close" id="loanTermsModalClose" aria-label="Close">&times;</span>

        <h4 class="mb-2">Loan period</h4>
        <p class="text-muted small mb-3">
            Use the patron policy default or set a shorter (or longer) due date for this checkout.
        </p>

        <div class="form-check mb-2">
            <input class="form-check-input" type="radio" name="loan_terms_mode" id="loanTermsDefault" value="default" checked>
            <label class="form-check-label" for="loanTermsDefault">
                Use current policy for this patron
                (<strong id="loanTermsDefaultDays">{{ $loanDefaultDaysStudent }}</strong> business days)
            </label>
        </div>

        <div class="form-check mb-3">
            <input class="form-check-input" type="radio" name="loan_terms_mode" id="loanTermsCustom" value="custom">
            <label class="form-check-label" for="loanTermsCustom">Custom due date or loan length</label>
        </div>

        <div id="loanTermsCustomPanel" class="d-none border rounded p-3 mb-3 bg-light">
            <div class="mb-3">
                <label for="loanTermsDueDate" class="form-label small mb-1">Due date</label>
                <input type="date" class="form-control" id="loanTermsDueDate" min="{{ now()->toDateString() }}">
            </div>
            <p class="small text-muted text-center mb-2">— or —</p>
            <div>
                <label for="loanTermsLoanDays" class="form-label small mb-1">Loan length (business days)</label>
                <input type="number" class="form-control" id="loanTermsLoanDays" min="1" max="365" placeholder="e.g. 3">
            </div>
        </div>

        <div class="d-flex gap-2 justify-content-end">
            <button type="button" class="btn btn-outline-secondary" id="loanTermsCancelBtn">Cancel</button>
            <button type="button" class="btn btn-primary" id="loanTermsConfirmBtn">Continue</button>
        </div>
    </div>
</div>
