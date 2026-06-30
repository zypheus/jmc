import { type ReactNode } from 'react';

import KioskPanel from '@/components/library/kiosk/KioskPanel';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    CIRCULATION_ROOM_USE,
    formatCurrency,
    formatDate,
    type KioskBorrowedBook,
} from '@/types/libraryKiosk';

interface BorrowedBooksTableProps {
    books: KioskBorrowedBook[];
    maxRenewalsPerLoan: number;
}

function StatusPill({
    children,
    tone = 'neutral',
}: {
    children: ReactNode;
    tone?: 'neutral' | 'warning' | 'success' | 'danger';
}) {
    const classes = {
        neutral: 'border-white/15 bg-white/10 text-white/80',
        warning: 'kiosk-pill-warning',
        success: 'kiosk-pill-success',
        danger: 'border-red-500/35 bg-red-500/15 text-red-300',
    }[tone];

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}>
            {children}
        </span>
    );
}

export default function BorrowedBooksTable({ books, maxRenewalsPerLoan }: BorrowedBooksTableProps) {
    return (
        <KioskPanel title="Borrowed books" description="Titles currently checked out to this account.">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-white/45">Title</TableHead>
                            <TableHead className="text-white/45">Type</TableHead>
                            <TableHead className="text-white/45">Due</TableHead>
                            <TableHead className="text-white/45">Renewals</TableHead>
                            <TableHead className="text-white/45">Status</TableHead>
                            <TableHead className="text-right text-white/45">Est. fine</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {books.length === 0 ? (
                            <TableRow className="border-white/10 hover:bg-white/[0.02]">
                                <TableCell colSpan={6} className="py-10 text-center text-white/40">
                                    No books checked out right now.
                                </TableCell>
                            </TableRow>
                        ) : (
                            books.map((log) => {
                                const isRoomUse = log.circulation_type === CIRCULATION_ROOM_USE;
                                const isLate = log.days_overdue > 0;

                                return (
                                    <TableRow key={log.id} className="border-white/10 hover:bg-white/[0.03]">
                                        <TableCell className="max-w-[14rem] font-medium text-white/90">
                                            {log.title ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-white/70">
                                            {isRoomUse ? (
                                                <StatusPill>In library</StatusPill>
                                            ) : (
                                                <StatusPill>Check out</StatusPill>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-white/70">{formatDate(log.due_date)}</TableCell>
                                        <TableCell className="text-white/70">
                                            {!isRoomUse ? `${log.renew_count}/${maxRenewalsPerLoan}` : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {isRoomUse ? (
                                                <StatusPill tone="neutral">No outside loan</StatusPill>
                                            ) : !log.due_date ? (
                                                <StatusPill tone="neutral">No due date</StatusPill>
                                            ) : isLate ? (
                                                <div>
                                                    <StatusPill tone="danger">Overdue</StatusPill>
                                                    <span className="mt-1 block text-xs text-white/45">
                                                        {log.days_overdue} day(s) after grace
                                                    </span>
                                                </div>
                                            ) : (
                                                <StatusPill tone="success">On time</StatusPill>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-white/90">
                                            {formatCurrency(log.total_fine)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </KioskPanel>
    );
}
