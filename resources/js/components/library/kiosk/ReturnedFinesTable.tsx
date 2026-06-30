import KioskPanel from '@/components/library/kiosk/KioskPanel';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { formatCurrency, formatDateTime, type KioskReturnedFine } from '@/types/libraryKiosk';

interface ReturnedFinesTableProps {
    rows: KioskReturnedFine[];
    totalOutstanding: number;
}

export default function ReturnedFinesTable({ rows, totalOutstanding }: ReturnedFinesTableProps) {
    if (rows.length === 0) {
        return null;
    }

    return (
        <KioskPanel
            title="Fines from returned books"
            description="Recorded at check-in. Pay at the circulation desk — staff marks fines paid or waived."
            action={
                totalOutstanding > 0 ? (
                    <span className="rounded-full border border-red-500/35 bg-red-500/15 px-3 py-1 text-xs font-medium text-red-300">
                        Still owed: {formatCurrency(totalOutstanding)}
                    </span>
                ) : (
                    <span className="kiosk-pill-success rounded-full px-3 py-1 text-xs font-medium">
                        Cleared
                    </span>
                )
            }
        >
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-white/45">Title</TableHead>
                            <TableHead className="text-white/45">Returned</TableHead>
                            <TableHead className="text-right text-white/45">Recorded</TableHead>
                            <TableHead className="text-white/45">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id} className="border-white/10 hover:bg-white/[0.03]">
                                <TableCell className="text-white/90">{row.title ?? '—'}</TableCell>
                                <TableCell className="text-white/65">{formatDateTime(row.returned_date)}</TableCell>
                                <TableCell className="text-right text-white/85">
                                    {formatCurrency(row.fine_incurred)}
                                </TableCell>
                                <TableCell>
                                    {row.fine_cleared_at ? (
                                        <div>
                                            <span className="kiosk-pill-success inline-flex rounded-full px-2.5 py-0.5 text-xs">
                                                {row.fine_clearance_type === 'waived' ? 'Waived' : 'Paid'}
                                            </span>
                                            <span className="mt-1 block text-xs text-white/45">
                                                {formatDateTime(row.fine_cleared_at)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="kiosk-pill-warning inline-flex rounded-full px-2.5 py-0.5 text-xs">
                                            Outstanding
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </KioskPanel>
    );
}
