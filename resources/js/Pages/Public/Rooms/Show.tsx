import { Head, Link } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GuestLayout from '@/Layouts/GuestLayout';

interface Reservation {
    id: number; date: string; start_time: string; end_time: string; status: string;
    patron_email: string | null; number_of_students: number;
    room?: { name: string }; students?: Array<{ id: number; name: string }>;
    logs?: Array<{ id: number; action: string; created_at: string }>;
}

export default function Show({ reservation }: { reservation: Reservation }) {
    return <GuestLayout><Head title="Reservation Details" /><div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-semibold">{reservation.room?.name ?? 'Reservation'}</h1><p className="text-muted-foreground">{new Date(`${reservation.date}T00:00:00`).toLocaleDateString()}</p></div><Button asChild variant="outline"><Link href="/rooms/schedule">Back to schedule</Link></Button></div><div className="grid gap-4 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader><CardTitle>Reservation Details</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Status</p><Badge>{reservation.status}</Badge></div><div><p className="text-xs text-muted-foreground">Patron email</p><p>{reservation.patron_email ?? '—'}</p></div><div><p className="text-xs text-muted-foreground">Students</p><p>{reservation.number_of_students}</p></div><div><p className="text-xs text-muted-foreground">Time</p><p>{reservation.start_time} – {reservation.end_time}</p></div><div className="sm:col-span-2"><p className="mb-2 text-xs text-muted-foreground">Attendees</p><ul className="list-disc pl-5">{reservation.students?.map((student) => <li key={student.id}>{student.name}</li>)}</ul></div></CardContent></Card><Card><CardHeader><CardTitle>Activity</CardTitle></CardHeader><CardContent className="space-y-3">{reservation.logs?.map((log) => <div key={log.id} className="border-b pb-2 last:border-0"><p className="capitalize">{log.action}</p><p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p></div>)}{!reservation.logs?.length && <p className="text-sm text-muted-foreground">No activity recorded.</p>}</CardContent></Card></div></div></GuestLayout>;
}
