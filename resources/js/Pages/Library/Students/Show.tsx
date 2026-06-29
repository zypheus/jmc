import { Head, Link, router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryLayout from '@/Layouts/LibraryLayout';

interface Student { id: number; id_number: string; firstname: string; lastname: string; middle_initial?: string | null; email?: string | null; mobile_number?: string | null; course?: string | null; year?: string | null; address?: string | null; qrcode?: string | null; profile_picture?: string | null }

export default function Show({ student }: { student: Student }) {
    const fields = [['Institutional ID', student.id_number], ['QR code', student.qrcode], ['Course', student.course], ['Year', student.year], ['Email', student.email], ['Mobile', student.mobile_number], ['Address', student.address]];
    return <LibraryLayout><Head title={`${student.firstname} ${student.lastname}`} /><div className="space-y-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-semibold">{student.lastname}, {student.firstname} {student.middle_initial ?? ''}</h1><p className="text-muted-foreground">Library student patron</p></div><div className="flex gap-2"><Button asChild variant="outline"><Link href="/students">Back</Link></Button><Button asChild><Link href={`/students/${student.id}/edit`}>Edit</Link></Button><Button variant="destructive" onClick={() => confirm('Delete this Library patron?') && router.delete(`/students/${student.id}`)}>Delete</Button></div></div><Card><CardHeader><CardTitle>Patron Details</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([label, value]) => <div key={label}><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1">{value || '—'}</p></div>)}</CardContent></Card></div></LibraryLayout>;
}
