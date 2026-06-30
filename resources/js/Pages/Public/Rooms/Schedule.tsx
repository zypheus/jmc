import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, DoorOpen, Hourglass, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import GuestLayout from '@/Layouts/GuestLayout';

interface Reservation {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    room?: { id: number; name: string };
}

interface Room {
    id: number;
    name: string;
}

function formatTime(value: string) {
    return new Date(`2000-01-01T${value}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function StatusBadge({ status }: { status: string }) {
    const approved = status === 'approved';

    return (
        <Badge
            variant="outline"
            className={approved
                ? 'gap-1.5 border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700'
                : 'gap-1.5 border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700'}
        >
            {approved ? <CheckCircle2 className="size-3.5" /> : <Hourglass className="size-3.5" />}
            <span className="capitalize">{status}</span>
        </Badge>
    );
}

export default function Schedule({ reservations, rooms }: { reservations: Reservation[]; rooms: Room[] }) {
    const visible = useMemo(() => reservations.filter((reservation) => reservation.status !== 'rejected'), [reservations]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [roomFilter, setRoomFilter] = useState('all');
    const approvedCount = visible.filter((reservation) => reservation.status === 'approved').length;
    const pendingCount = visible.filter((reservation) => reservation.status === 'pending').length;
    const filteredReservations = useMemo(
        () => visible.filter((reservation) =>
            (statusFilter === 'all' || reservation.status === statusFilter)
            && (roomFilter === 'all' || reservation.room?.id.toString() === roomFilter)),
        [roomFilter, statusFilter, visible],
    );

    return (
        <GuestLayout showHeader={false}>
            <Head title="Room Schedule" />
            <div className="space-y-6">
                <section className="relative overflow-hidden rounded-2xl bg-[#15366f] px-6 py-8 text-white shadow-xl shadow-blue-950/10 sm:px-8 sm:py-10">
                    <div className="absolute -right-16 -top-20 size-64 rounded-full border-[32px] border-white/5" aria-hidden="true" />
                    <div className="absolute -bottom-20 right-36 size-44 rounded-full bg-[#ffd700]/10 blur-2xl" aria-hidden="true" />
                    <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
                                <CalendarDays className="size-3.5 text-[#ffd700]" />
                                Library spaces
                            </div>
                            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Room reservation schedule</h1>
                            <p className="mt-3 max-w-xl text-base leading-relaxed text-blue-50/90">
                                Check room availability and review pending or confirmed library bookings in one place.
                            </p>
                        </div>
                        <Link
                            href="/rooms/book"
                            className={buttonVariants({ size: 'lg', className: 'w-full bg-[#ffd700] text-[#15366f] shadow-lg hover:bg-[#ffe44d] md:w-auto' })}
                        >
                            Book a room <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-3" aria-label="Schedule summary">
                    {[
                        { label: 'Total bookings', value: visible.length, icon: CalendarDays, color: 'bg-blue-50 text-[#1f4ea7]' },
                        { label: 'Approved', value: approvedCount, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Awaiting approval', value: pendingCount, icon: Hourglass, color: 'bg-amber-50 text-amber-700' },
                    ].map((item) => (
                        <Card key={item.label} className="gap-0 p-5 shadow-sm transition-transform hover:-translate-y-0.5">
                            <CardContent className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                                    <p className="mt-1 font-display text-3xl font-semibold text-slate-900">{item.value}</p>
                                </div>
                                <span className={`grid size-11 place-items-center rounded-xl ${item.color}`}><item.icon className="size-5" /></span>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <Card className="gap-0 p-0 shadow-sm">
                    <div className="flex flex-col gap-4 border-b px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="font-display text-xl font-semibold text-slate-900">Bookings</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {filteredReservations.length} {filteredReservations.length === 1 ? 'reservation' : 'reservations'} shown
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1" aria-label="Filter by status">
                                {['all', 'approved', 'pending'].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setStatusFilter(status)}
                                        className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${statusFilter === status
                                            ? 'bg-white text-[#15366f] shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <label className="relative">
                                <span className="sr-only">Filter by room</span>
                                <DoorOpen className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={roomFilter}
                                    onChange={(event) => setRoomFilter(event.target.value)}
                                    className="h-9 min-w-40 appearance-none rounded-lg border bg-white pl-9 pr-8 text-sm text-slate-700"
                                >
                                    <option value="all">All rooms ({rooms.length})</option>
                                    {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                                </select>
                            </label>
                        </div>
                    </div>

                    <CardContent>
                        <div className="hidden overflow-x-auto md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/80">
                                        <TableHead className="pl-6">Room</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReservations.map((reservation) => (
                                        <TableRow key={reservation.id} className="group">
                                            <TableCell className="pl-6 font-semibold text-slate-900">
                                                <span className="flex items-center gap-2.5">
                                                    <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-[#1f4ea7]"><DoorOpen className="size-4" /></span>
                                                    {reservation.room?.name ?? 'Room unavailable'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{formatDate(reservation.date)}</TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-2 text-slate-600">
                                                    <Clock3 className="size-4 text-slate-400" />
                                                    {formatTime(reservation.start_time)} – {formatTime(reservation.end_time)}
                                                </span>
                                            </TableCell>
                                            <TableCell><StatusBadge status={reservation.status} /></TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Link
                                                    href={`/rooms/${reservation.id}/show`}
                                                    className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-[#1f4ea7]' })}
                                                >
                                                    Details <ArrowRight className="size-3.5" />
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="divide-y md:hidden">
                            {filteredReservations.map((reservation) => (
                                <article key={reservation.id} className="space-y-4 px-5 py-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#1f4ea7]"><DoorOpen className="size-5" /></span>
                                            <div>
                                                <h3 className="font-display font-semibold text-slate-900">{reservation.room?.name ?? 'Room unavailable'}</h3>
                                                <p className="mt-0.5 text-sm text-slate-500">{formatDate(reservation.date)}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={reservation.status} />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                                        <span className="flex items-center gap-2 text-sm text-slate-600">
                                            <Clock3 className="size-4 text-slate-400" />
                                            {formatTime(reservation.start_time)} – {formatTime(reservation.end_time)}
                                        </span>
                                        <Link href={`/rooms/${reservation.id}/show`} className="text-sm font-semibold text-[#1f4ea7]">View</Link>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {filteredReservations.length === 0 && (
                            <div className="grid place-items-center px-6 py-14 text-center">
                                <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><SlidersHorizontal className="size-6" /></span>
                                <h3 className="font-display font-semibold text-slate-900">No matching reservations</h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try another room or status, or start a new room booking.</p>
                                <Link href="/rooms/book" className={buttonVariants({ variant: 'outline', className: 'mt-5' })}>Book a room</Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
