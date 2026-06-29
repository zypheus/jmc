import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LibraryLayout from '@/Layouts/LibraryLayout';

export default function ScanMessage({ message, overduePatronsWithMobile }: { message: string; overduePatronsWithMobile: number }) {
    const scan = useForm({ message });
    const overdue = useForm({ message: 'Hello {name}, you have {count} overdue book(s): {titles}.' });
    const save = (event: FormEvent) => { event.preventDefault(); scan.post('/sms/scan-message'); };
    const sendOverdue = (event: FormEvent) => { event.preventDefault(); overdue.post('/sms/send-overdue'); };
    return <LibraryLayout><Head title="Library SMS Settings" /><div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-2xl font-semibold">Library SMS Settings</h1><p className="text-muted-foreground">Manage scanner and overdue notification messages.</p></div><Card><CardHeader><CardTitle>Scanner Message</CardTitle><CardDescription>Available placeholders: {'{name}'} and {'{status}'}.</CardDescription></CardHeader><CardContent><form onSubmit={save} className="space-y-4"><div className="space-y-2"><Label htmlFor="scan-message">Template</Label><Textarea id="scan-message" rows={5} value={scan.data.message} onChange={(event) => scan.setData('message', event.target.value)} />{scan.errors.message && <p className="text-sm text-destructive">{scan.errors.message}</p>}</div><Button disabled={scan.processing}>Save template</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Overdue Reminder</CardTitle><CardDescription>{overduePatronsWithMobile} patron(s) currently qualify. Placeholders: {'{name}'}, {'{count}'}, {'{titles}'}.</CardDescription></CardHeader><CardContent><form onSubmit={sendOverdue} className="space-y-4"><Textarea rows={5} value={overdue.data.message} onChange={(event) => overdue.setData('message', event.target.value)} /><Button disabled={overdue.processing || overduePatronsWithMobile === 0}>Send overdue reminders</Button></form></CardContent></Card></div></LibraryLayout>;
}
