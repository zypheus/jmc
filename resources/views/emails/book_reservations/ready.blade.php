@php
    $book = $reservation->book;
    $title = $book?->title_statement ?? 'Untitled';
    $author = $book?->main_author;
    $appName = config('app.name', 'PANTAS');
    $kioskUrl = route('library.kiosk.scan');
    $opacUrl = route('library.landing');
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reserved book ready</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#333333;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#1f4ea7 0%,#ca8a04 100%);padding:24px 28px;">
                            <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.9);">{{ $appName }} Library</p>
                            <h1 style="margin:0;font-size:22px;line-height:1.3;color:#ffffff;">Your reserved book is ready for pickup</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 28px;">
                            @if($studentName)
                            <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hello {{ $studentName }},</p>
                            @endif
                            <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">
                                A copy you reserved through the OPAC is now <strong style="color:#ca8a04;">on hold</strong> for you at the circulation desk.
                            </p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:20px;">
                                <tr>
                                    <td style="padding:16px 18px;">
                                        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#92400e;">Book</p>
                                        <p style="margin:0;font-size:18px;font-weight:bold;color:#1f2937;">{{ $title }}</p>
                                        @if($author)
                                            <p style="margin:6px 0 0;font-size:14px;color:#64748b;">{{ $author }}</p>
                                        @endif
                                        @if($book?->barcode)
                                            <p style="margin:8px 0 0;font-size:13px;color:#64748b;">Barcode: {{ $book->barcode }}</p>
                                        @endif
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
                                Pick up this copy before <strong>{{ $expiresAt->timezone('Asia/Manila')->format('M j, Y g:i A') }}</strong>
                                ({{ $holdDays }} {{ $holdDays === 1 ? 'day' : 'days' }} hold period). After that, the reservation may be cancelled and the book returned to the shelf.
                            </p>

                            <table role="presentation" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding-right:8px;">
                                        <a href="{{ $kioskUrl }}" style="display:inline-block;padding:11px 16px;background-color:#1f4ea7;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">Student lookup</a>
                                    </td>
                                    <td>
                                        <a href="{{ $opacUrl }}" style="display:inline-block;padding:11px 16px;background-color:#ffffff;color:#1f4ea7;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;border:1px solid #1f4ea7;">OPAC</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 28px 22px;border-top:1px solid #e2e8f0;background-color:#f8fafc;">
                            <p style="margin:0;font-size:13px;color:#64748b;">
                                Thanks,<br>
                                <strong style="color:#1f4ea7;">{{ $appName }} Library</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
