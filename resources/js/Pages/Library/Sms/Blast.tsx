import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LibraryLayout from '@/Layouts/LibraryLayout';

export default function Blast({ courses, years }: { courses: string[]; years: string[] }) {
    const form = useForm({ message: '', course: '', year: '' });
    const [recipientCount, setRecipientCount] = useState<number | null>(null);
    useEffect(() => {
        const params = new URLSearchParams();
        if (form.data.course) params.set('course', form.data.course);
        if (form.data.year) params.set('year', form.data.year);
        fetch(`/sms/count?${params}`).then((response) => response.json()).then((data) => setRecipientCount(data.count)).catch(() => setRecipientCount(null));
    }, [form.data.course, form.data.year]);
    const submit = (event: FormEvent) => { event.preventDefault(); form.post('/sms/send'); };
    return <LibraryLayout><Head title="Library SMS Blast" /><div className="mx-auto max-w-2xl space-y-6"><div><h1 className="text-2xl font-semibold">Library SMS Blast</h1><p className="text-muted-foreground">Send a message to Library student patrons matching the selected filters.</p></div><Card><CardHeader><CardTitle>Recipients</CardTitle><CardDescription>{recipientCount === null ? 'Counting recipients…' : `${recipientCount} patron${recipientCount === 1 ? '' : 's'} selected`}</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="course">Course</Label><select id="course" className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={form.data.course} onChange={(event) => form.setData('course', event.target.value)}><option value="">All courses</option>{courses.map((course) => <option key={course} value={course}>{course}</option>)}</select></div><div className="space-y-2"><Label htmlFor="year">Year</Label><select id="year" className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={form.data.year} onChange={(event) => form.setData('year', event.target.value)}><option value="">All years</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></div></div><div className="space-y-2"><Label htmlFor="message">Message</Label><Textarea id="message" rows={7} placeholder="Hello {name}, …" value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} />{form.errors.message && <p className="text-sm text-destructive">{form.errors.message}</p>}</div><Button disabled={form.processing || recipientCount === 0}>Send SMS blast</Button></form></CardContent></Card></div></LibraryLayout>;
}
