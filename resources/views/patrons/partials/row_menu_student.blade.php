<div class="dropdown patron-dir__row-menu">
    <button type="button"
            class="patron-dir__menu-btn"
            data-bs-toggle="dropdown"
            data-bs-boundary="viewport"
            aria-expanded="false"
            aria-label="Actions for {{ $student->firstname }} {{ $student->lastname }}">
        ⋮
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
        <li><h6 class="dropdown-header">Record</h6></li>
        <li>
            <a class="dropdown-item" href="{{ route('library.students.edit', $student->id) }}">Edit patron</a>
        </li>
        <li>
            <form action="{{ route('library.students.destroy', $student->id) }}" method="POST"
                  onsubmit="return confirm('Delete this student record?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="dropdown-item text-danger">Delete</button>
            </form>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li><h6 class="dropdown-header">ID card</h6></li>
        <li>
            <a class="dropdown-item" href="{{ url('idcard/front/' . $student->id) }}" target="_blank" rel="noopener">
                Preview front
            </a>
        </li>
        <li>
            <a class="dropdown-item" href="{{ url('idcard/back/' . $student->id) }}" target="_blank" rel="noopener">
                Preview back
            </a>
        </li>
        <li>
            <a class="dropdown-item" href="{{ url('idcard/download/' . $student->id) }}">Download ZIP</a>
        </li>
    </ul>
</div>
