import { Head } from '@inertiajs/react';

import EmptyState from '@/components/library/EmptyState';
import PageHeader from '@/components/library/PageHeader';
import StatusBadge from '@/components/library/StatusBadge';
import PaginationLinks from '@/components/PaginationLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface ReservationLog {
    id: number;
    action: string;
    created_at: string;
    user: { name?: string | null; fullName?: string | null } | null;
    reservation: {
        id: number;
        date: string | null;
        room: { name: string } | null;
    } | null;
}

interface LogsProps extends PageProps {
    logs: Paginated<ReservationLog>;
}

function formatDateTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-PH');
}

function actionTone(action: string) {
    if (action === 'approved') return 'approved';
    if (action === 'rejected') return 'rejected';
    if (action === 'created') return 'pending';
    return 'pending';
}

export default function Logs({ logs }: LogsProps) {
    return (
        <LibraryLayout>
            <Head title="Room Reservation Logs" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Library"
                    title="Room reservation logs"
                    description="Audit trail of room reservation actions."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Room reservation activity logs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {logs.data.length === 0 ? (
                            <EmptyState
                                title="No reservation logs"
                                description="Room reservation activity will appear here once actions are recorded."
                            />
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Room</TableHead>
                                            <TableHead>Reservation Date</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>By</TableHead>
                                            <TableHead>When</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{log.reservation?.room?.name ?? '—'}</TableCell>
                                                <TableCell>{log.reservation?.date ?? '—'}</TableCell>
                                                <TableCell>
                                                    <StatusBadge tone={actionTone(log.action)}>{log.action}</StatusBadge>
                                                </TableCell>
                                                <TableCell>{log.user?.fullName ?? log.user?.name ?? 'System'}</TableCell>
                                                <TableCell>{formatDateTime(log.created_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <PaginationLinks links={logs.links} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
