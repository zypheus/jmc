import { Head, Link } from '@inertiajs/react';

import EmptyState from '@/components/library/EmptyState';
import PageHeader from '@/components/library/PageHeader';
import StatusBadge from '@/components/library/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface ReservationStudent {
    id: number;
    name: string;
}

interface ReservationRoom {
    id: number;
    name: string;
}

interface Reservation {
    id: number;
    date: string | null;
    start_time: string | null;
    end_time: string | null;
    patron_email: string | null;
    number_of_students: number | null;
    status: string;
    room: ReservationRoom | null;
    students: ReservationStudent[];
}

interface PendingProps extends PageProps {
    reservations: Reservation[];
}

function formatDate(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-PH');
}

function formatTime(value: string | null): string {
    if (!value) return '—';
    const parsed = new Date(`1970-01-01T${value}`);
    return Number.isNaN(parsed.getTime())
        ? value
        : parsed.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

export default function Pending({ reservations }: PendingProps) {
    return (
        <LibraryLayout>
            <Head title="Room Pending Requests" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Library"
                    title="Pending room requests"
                    description="Review room reservations waiting for approval."
                    actions={
                        <>
                            <Link href="/rooms/logs">
                                <Button variant="outline" size="sm">
                                    View logs
                                </Button>
                            </Link>
                            <Link href="/dashboard/library-admin">
                                <Button variant="outline" size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                        </>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Reservation queue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reservations.length === 0 ? (
                            <EmptyState
                                title="No pending requests"
                                description="All reservation requests have already been processed."
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Room</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Students</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reservations.map((reservation) => (
                                        <TableRow key={reservation.id}>
                                            <TableCell>
                                                <p className="font-medium">{reservation.room?.name ?? 'Unknown room'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {reservation.patron_email ?? 'No contact email'}
                                                </p>
                                            </TableCell>
                                            <TableCell>{formatDate(reservation.date)}</TableCell>
                                            <TableCell>
                                                {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                            </TableCell>
                                            <TableCell className="max-w-80 whitespace-normal">
                                                {reservation.students.length > 0
                                                    ? reservation.students.map((student) => student.name).join(', ')
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge tone="pending">{reservation.status}</StatusBadge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Link href={`/rooms/${reservation.id}/approve`} method="post" as="button">
                                                        <Button size="sm">Approve</Button>
                                                    </Link>
                                                    <Link href={`/rooms/reject/${reservation.id}`} method="post" as="button">
                                                        <Button size="sm" variant="destructive">
                                                            Reject
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
