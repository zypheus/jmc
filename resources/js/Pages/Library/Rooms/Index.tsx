import { Head, Link, router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryLayout from '@/Layouts/LibraryLayout';

interface Room { id: number; name: string; description: string | null; capacity: number }

export default function Index({ rooms }: { rooms: Room[] }) {
    return (
        <LibraryLayout>
            <Head title="Manage Rooms" />
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-semibold">Manage Rooms</h1><p className="text-muted-foreground">Maintain bookable library spaces.</p></div><Button asChild className="w-full sm:w-auto"><Link href="/rooms/create">Add room</Link></Button></div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {rooms.map((room) => <Card key={room.id} className="group transition-all duration-200 hover:-translate-y-1 hover:ring-[#0f5238]/35 hover:shadow-lg hover:shadow-slate-200/70 motion-reduce:hover:translate-y-0"><CardHeader><CardTitle className="transition-colors duration-200 group-hover:text-[#0f5238]">{room.name}</CardTitle><CardDescription>{room.description || 'No description provided.'}</CardDescription></CardHeader><CardContent className="space-y-4"><p className="text-sm">Capacity: <strong>{room.capacity}</strong></p><div className="flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><Link href={`/rooms/${room.id}/edit`}>Edit</Link></Button><Button variant="destructive" size="sm" onClick={() => confirm(`Delete ${room.name}?`) && router.delete(`/rooms/${room.id}`)}>Delete</Button></div></CardContent></Card>)}
                </div>
                {rooms.length === 0 && <Card><CardContent className="py-10 text-center text-muted-foreground">No rooms configured yet.</CardContent></Card>}
            </div>
        </LibraryLayout>
    );
}
