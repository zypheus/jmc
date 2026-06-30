import { type ReactNode } from 'react';

import { formatDate, formatDateTime, type KioskReservation } from '@/types/libraryKiosk';

interface ReservationAlertsProps {
    ready: KioskReservation[];
    pending: KioskReservation[];
    hasEmail: boolean;
}

function AlertBlock({
    title,
    tone,
    children,
}: {
    title: string;
    tone: 'ready' | 'waiting' | 'info';
    children: ReactNode;
}) {
    const styles = {
        ready: 'kiosk-alert-warning',
        waiting: 'border-[var(--jmc-blue)]/35 bg-[var(--jmc-blue)]/10',
        info: 'border-white/10 bg-white/[0.04]',
    }[tone];

    return (
        <div className={`rounded-2xl border px-5 py-4 sm:px-6 ${styles}`}>
            <h3 className="font-display text-sm font-semibold text-white">{title}</h3>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-white/70">{children}</div>
        </div>
    );
}

export default function ReservationAlerts({ ready, pending, hasEmail }: ReservationAlertsProps) {
    if (ready.length === 0 && pending.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {ready.length > 0 && (
                <AlertBlock title={`Reserved book${ready.length > 1 ? 's' : ''} ready for pickup`} tone="ready">
                    <ul className="space-y-3">
                        {ready.map((reservation) => (
                            <li key={reservation.id}>
                                <p className="font-medium text-white">{reservation.book?.title_statement ?? 'Untitled'}</p>
                                {reservation.book?.barcode && (
                                    <p className="text-white/50">{reservation.book.barcode}</p>
                                )}
                                <p className="mt-1 text-[var(--jmc-gold)]">
                                    Pick up by {formatDateTime(reservation.expires_at)}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <p className="pt-2 text-white/60">Visit the circulation desk before the hold expires.</p>
                </AlertBlock>
            )}

            {pending.length > 0 && (
                <AlertBlock title="Waiting for a copy" tone="waiting">
                    <ul className="space-y-2">
                        {pending.map((reservation) => (
                            <li key={reservation.id}>
                                <span className="font-medium text-white">
                                    {reservation.book?.title_statement ?? 'Untitled'}
                                </span>
                                {' — reserved '}
                                {formatDate(reservation.reserved_at)}.
                                {hasEmail
                                    ? ' You will be notified here and by email when it is returned.'
                                    : ' You will be notified here when it is returned.'}
                            </li>
                        ))}
                    </ul>
                </AlertBlock>
            )}

            {!hasEmail && (ready.length > 0 || pending.length > 0) && (
                <AlertBlock title="Get email alerts" tone="info">
                    <p>
                        Add your email through <strong className="text-white">Request edit</strong> to receive
                        pickup notifications.
                    </p>
                </AlertBlock>
            )}

            {(ready.length > 0 || pending.length > 0) && (
                <section className="kiosk-surface">
                    <div className="border-b border-white/10 bg-[var(--jmc-blue)]/10 px-5 py-4 sm:px-6">
                        <h3 className="font-display text-sm font-semibold text-white">OPAC reservations</h3>
                    </div>
                    <div className="divide-y divide-white/10">
                        {ready.map((reservation) => (
                            <div
                                key={`ready-${reservation.id}`}
                                className="grid gap-2 px-5 py-4 sm:grid-cols-4 sm:px-6"
                            >
                                <p className="font-medium text-white sm:col-span-1">
                                    {reservation.book?.title_statement ?? '—'}
                                </p>
                                <p className="text-sm text-[var(--jmc-gold)]">Ready — pick up now</p>
                                <p className="text-sm text-white/55">{formatDate(reservation.reserved_at)}</p>
                                <p className="text-sm text-white/55">{formatDateTime(reservation.expires_at)}</p>
                            </div>
                        ))}
                        {pending.map((reservation) => (
                            <div
                                key={`pending-${reservation.id}`}
                                className="grid gap-2 px-5 py-4 sm:grid-cols-4 sm:px-6"
                            >
                                <p className="font-medium text-white sm:col-span-1">
                                    {reservation.book?.title_statement ?? '—'}
                                </p>
                                <p className="text-sm text-white/60">Waiting (checked out)</p>
                                <p className="text-sm text-white/55">{formatDate(reservation.reserved_at)}</p>
                                <p className="text-sm text-white/35">—</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
