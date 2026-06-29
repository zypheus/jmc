import { Head, Link } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import GuestLayout from '@/Layouts/GuestLayout';

interface Reservation { id: number; date: string; start_time: string; end_time: string; status: string; room?: { name: string } }
interface Room { id: number }

function formatTime(value: string) {
    return new Date(`2000-01-01T${value}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function Schedule({ reservations, rooms }: { reservations: Reservation[]; rooms: Room[] }) {
    const visible = reservations.filter((reservation) => reservation.status !== 'rejected');
    return <GuestLayout><Head title="Room Schedule" /><div className="space-y-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-semibold">Room Reservation Schedule</h1><p className="text-muted-foreground">View pending and approved library room bookings.</p></div><Button asChild><Link href="/rooms/book">Book a room</Link></Button></div><div className="grid gap-3 sm:grid-cols-3"><Card><CardHeader><CardTitle className="text-sm">Reservations</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{visible.length}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Approved</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{visible.filter((item) => item.status === 'approved').length}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Rooms</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{rooms.length}</CardContent></Card></div><Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead>Room</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader><TableBody>{visible.map((reservation) => <TableRow key={reservation.id}><TableCell className="font-medium">{reservation.room?.name ?? 'N/A'}</TableCell><TableCell>{new Date(`${reservation.date}T00:00:00`).toLocaleDateString()}</TableCell><TableCell>{formatTime(reservation.start_time)} – {formatTime(reservation.end_time)}</TableCell><TableCell><Badge variant={reservation.status === 'approved' ? 'default' : 'secondary'}>{reservation.status}</Badge></TableCell><TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href={`/rooms/${reservation.id}/show`}>View</Link></Button></TableCell></TableRow>)}</TableBody></Table>{visible.length === 0 && <p className="py-8 text-center text-muted-foreground">No reservations yet.</p>}</CardContent></Card></div></GuestLayout>;
}
