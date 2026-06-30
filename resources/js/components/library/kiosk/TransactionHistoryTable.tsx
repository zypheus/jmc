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
    formatCurrency,
    formatDate,
    formatDateTime,
    type KioskTransactionRow,
} from '@/types/libraryKiosk';

interface TransactionHistoryTableProps {
    rows: KioskTransactionRow[];
}

export default function TransactionHistoryTable({ rows }: TransactionHistoryTableProps) {
    return (
        <KioskPanel
            title="Transaction history"
            description="Recent check outs, returns, and room use — newest first, up to 75 entries."
        >
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-white/45">When</TableHead>
                            <TableHead className="text-white/45">Book</TableHead>
                            <TableHead className="text-white/45">Barcode</TableHead>
                            <TableHead className="text-white/45">Status</TableHead>
                            <TableHead className="text-white/45">Summary</TableHead>
                            <TableHead className="text-white/45">Due</TableHead>
                            <TableHead className="text-white/45">Returned</TableHead>
                            <TableHead className="text-right text-white/45">Fine</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow className="border-white/10 hover:bg-white/[0.02]">
                                <TableCell colSpan={8} className="py-10 text-center text-white/40">
                                    No transactions on file yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => (
                                <TableRow key={row.id} className="border-white/10 hover:bg-white/[0.03]">
                                    <TableCell className="whitespace-nowrap text-sm text-white/70">
                                        {row.timestamp_manila ?? '—'}
                                    </TableCell>
                                    <TableCell className="max-w-[12rem] text-white/90">{row.title ?? '—'}</TableCell>
                                    <TableCell className="text-sm text-white/55">{row.barcode ?? '—'}</TableCell>
                                    <TableCell>
                                        <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-xs text-white/75">
                                            {row.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-white/65">{row.history_summary}</TableCell>
                                    <TableCell className="text-sm text-white/65">{formatDate(row.due_date)}</TableCell>
                                    <TableCell className="text-sm text-white/65">
                                        {formatDateTime(row.returned_date)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-white/80">
                                        {row.fine_incurred !== null && row.fine_incurred > 0
                                            ? formatCurrency(row.fine_incurred)
                                            : '—'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </KioskPanel>
    );
}
