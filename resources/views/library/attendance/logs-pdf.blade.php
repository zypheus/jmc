<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Library Attendance Logs</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        th { background: #f3f4f6; }
    </style>
</head>
<body>
    <h1>Library Attendance Logs</h1>
    <p>Exported {{ now()->timezone('Asia/Manila')->format('Y-m-d h:i A') }}</p>
    <table>
        <thead>
            <tr>
                <th>Patron Type</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Course / Department</th>
                <th>Section</th>
                <th>Status</th>
                <th>Scanned At</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($logs as $log)
                @php($patron = $log->patron())
                <tr>
                    <td>{{ $log->patronType() ?? 'unknown' }}</td>
                    <td>{{ $patron->lastname ?? '-' }}</td>
                    <td>{{ $patron->firstname ?? '-' }}</td>
                    <td>
                        @if ($log->student)
                            {{ $log->student->course ?? '-' }}
                        @elseif ($log->employee)
                            {{ $log->employee->department ?? '-' }}
                        @else
                            -
                        @endif
                    </td>
                    <td>{{ $log->section ?? '-' }}</td>
                    <td>{{ strtoupper($log->status) }}</td>
                    <td>{{ $log->scanned_at?->timezone('Asia/Manila')->format('Y-m-d h:i A') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
