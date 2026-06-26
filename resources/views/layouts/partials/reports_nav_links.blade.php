<a href="{{ route('attendance.logs.index') }}">Attendance Logs</a>
@can('isAdmin')
<a href="{{ route('attendance.feedback.index') }}">Gate Feedback Responses</a>
<a href="{{ route('library.fines.outstanding') }}">Outstanding Fines</a>
@endcan
<a href="{{ route('library.reports.library_holdings.create') }}">Library Holdings Report</a>
<a href="{{ route('library.book.report.download') }}">Download Book Report (PDF)</a>
<a href="{{ route('library.feedback.index') }}">Student Feedback</a>
<a href="{{ route('library.admin.activities.index') }}">Activity log</a>
@can('isAdmin')
<a href="{{ route('library.rooms.logs') }}">Reservation Logs</a>
@endcan
