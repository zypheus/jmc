import { formatCurrency } from '@/types/libraryKiosk';

interface PatronFineSummaryProps {
    totalOutstandingFine: number;
    totalReturnedFinesOutstanding: number;
    grandDue: number;
    booksOutCount: number;
    overdueBooksCount: number;
}

export default function PatronFineSummary({
    totalOutstandingFine,
    totalReturnedFinesOutstanding,
    grandDue,
    booksOutCount,
    overdueBooksCount,
}: PatronFineSummaryProps) {
    const hasIssue = grandDue > 0 || overdueBooksCount > 0;

    return (
        <section
            className={`rounded-2xl border px-5 py-5 text-center sm:px-6 ${
                hasIssue ? 'kiosk-fine-balance-warning' : 'kiosk-fine-balance-clear'
            }`}
        >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">Account balance</p>
            <p className="font-display mt-2 text-3xl font-semibold text-white">{formatCurrency(grandDue)}</p>
            <p className="mt-1 text-sm text-white/55">Combined outstanding estimate</p>

            <div className="mt-4 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
                <p>Current loans: {formatCurrency(totalOutstandingFine)}</p>
                {totalReturnedFinesOutstanding > 0 && (
                    <p>Returned books: {formatCurrency(totalReturnedFinesOutstanding)}</p>
                )}
            </div>

            {!hasIssue && booksOutCount === 0 && totalReturnedFinesOutstanding <= 0 && (
                <p className="mt-3 text-sm text-[var(--jmc-green)]">
                    No active checkouts and no uncleared return fines.
                </p>
            )}
            {overdueBooksCount > 0 && (
                <p className="mt-3 text-sm text-[var(--jmc-gold)]">
                    {overdueBooksCount} overdue item{overdueBooksCount > 1 ? 's' : ''} — visit the circulation desk.
                </p>
            )}
        </section>
    );
}
