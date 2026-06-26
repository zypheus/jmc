<a href="{{ route('library.logs.index') }}">Circulation</a>
<a href="{{ route('library.catalog.copy.openlibrary.form') }}">Copy Cataloging</a>
<a href="{{ route('library.rfid.scanner') }}" hidden>RFID Scanner</a>
@can('isAdmin')
<a href="{{ route('library.circulation.policy.edit') }}">Circulation Policy</a>
@endcan
