import { formatCurrency } from '@/types/libraryKiosk';

interface PatronSummaryCardsProps {
    booksOutCount: number;
    overdueBooksCount: number;
    totalOutstandingFine: number;
}

export default function PatronSummaryCards({
    booksOutCount,
    overdueBooksCount,
    totalOutstandingFine,
}: PatronSummaryCardsProps) {
    const stats = [
        {
            label: 'Checked out',
            value: String(booksOutCount),
            hint: 'Active loans',
            tone: 'default' as const,
        },
        {
            label: 'Overdue',
            value: String(overdueBooksCount),
            hint: 'Past grace period',
            tone: overdueBooksCount > 0 ? ('warning' as const) : ('success' as const),
        },
        {
            label: 'Est. fine',
            value: formatCurrency(totalOutstandingFine),
            hint: 'On current loans',
            tone: 'default' as const,
        },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={`rounded-xl border px-4 py-4 text-center backdrop-blur-sm ${
                        stat.tone === 'warning'
                            ? 'kiosk-stat-warning'
                            : stat.tone === 'success'
                              ? 'kiosk-stat-success'
                              : 'border-white/10 bg-white/[0.04]'
                    }`}
                >
                    <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/45">
                        {stat.label}
                    </p>
                    <p
                        className={`font-display mt-2 text-2xl font-semibold sm:text-3xl ${
                            stat.tone === 'warning'
                                ? 'text-[var(--jmc-gold)]'
                                : stat.tone === 'success'
                                  ? 'text-[var(--jmc-green)]'
                                  : 'text-white'
                        }`}
                    >
                        {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-white/45">{stat.hint}</p>
                </div>
            ))}
        </div>
    );
}
