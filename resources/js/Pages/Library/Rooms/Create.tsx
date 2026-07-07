import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LibraryLayout from '@/Layouts/LibraryLayout';

export default function Create() {
    const form = useForm({ name: '', description: '', capacity: 10 });
    const submit = (event: FormEvent) => { event.preventDefault(); form.post('/rooms'); };
    return <LibraryLayout><Head title="Add Room" /><div className="mx-auto max-w-xl space-y-6"><div><h1 className="text-2xl font-semibold">Add Room</h1><p className="text-muted-foreground">Create a new bookable library room.</p></div><Card><CardHeader><CardTitle>Room Details</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />{form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}</div><div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="capacity">Capacity</Label><Input id="capacity" type="number" min={1} value={form.data.capacity} onChange={(event) => form.setData('capacity', Number(event.target.value))} />{form.errors.capacity && <p className="text-sm text-destructive">{form.errors.capacity}</p>}</div><div className="flex flex-wrap gap-2"><Button disabled={form.processing}>Save room</Button><Button asChild variant="outline"><Link href="/rooms">Cancel</Link></Button></div></form></CardContent></Card></div></LibraryLayout>;
}
