<div class="dropdown patron-dir__row-menu">
    <button type="button"
            class="patron-dir__menu-btn"
            data-bs-toggle="dropdown"
            data-bs-boundary="viewport"
            aria-expanded="false"
            aria-label="Actions for {{ $employee->firstname }} {{ $employee->lastname }}">
        ⋮
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
        <li><h6 class="dropdown-header">Record</h6></li>
        <li>
            <a class="dropdown-item" href="{{ route('library.employees.edit', $employee->id) }}">Edit patron</a>
        </li>
        <li>
            <form action="{{ route('library.employees.destroy', $employee->id) }}" method="POST"
                  onsubmit="return confirm('Delete this record?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="dropdown-item text-danger">Delete</button>
            </form>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li><h6 class="dropdown-header">ID card</h6></li>
        <li>
            <a class="dropdown-item" href="{{ route('library.employees.id.front', $employee->id) }}" target="_blank" rel="noopener">
                Preview front
            </a>
        </li>
        <li>
            <a class="dropdown-item" href="{{ route('library.employees.id.back', $employee->id) }}" target="_blank" rel="noopener">
                Preview back
            </a>
        </li>
        <li>
            <a class="dropdown-item" href="{{ route('library.employees.id.download', $employee->id) }}">Download ZIP</a>
        </li>
    </ul>
</div>
