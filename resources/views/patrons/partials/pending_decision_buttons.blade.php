<div class="patron-dir__decision-btns">
    <form action="{{ $approveRoute }}" method="POST" class="d-inline">
        @csrf
        <button type="submit" class="patron-dir__btn patron-dir__btn--success patron-dir__btn--sm">Approve</button>
    </form>
    <form action="{{ $rejectRoute }}" method="POST" class="d-inline"
          onsubmit="return confirm('Reject this registration?');">
        @csrf
        <button type="submit" class="patron-dir__btn patron-dir__btn--danger patron-dir__btn--sm">Reject</button>
    </form>
</div>
