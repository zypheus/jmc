import axios from 'axios';
import { Head } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LibraryLayout from '@/Layouts/LibraryLayout';

export default function Scanner() {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    async function submit(event: FormEvent) { event.preventDefault(); setProcessing(true); try { const response = await axios.post('/rfid-scan', { copy_identifier: code }); setMessage(response.data.success ?? response.data.alert ?? 'Scan completed.'); } catch (error) { if (axios.isAxiosError(error)) setMessage(error.response?.data?.error ?? 'Unable to check this copy.'); } finally { setProcessing(false); } }
    return <LibraryLayout><Head title="RFID Scanner" /><div className="mx-auto max-w-xl space-y-6"><div><h1 className="text-2xl font-semibold">RFID Copy Scanner</h1><p className="text-muted-foreground">Check whether a scanned copy is currently checked out.</p></div><Card><CardHeader><CardTitle>Scan Copy</CardTitle><CardDescription>Enter an accession number, barcode, or RFID.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="copy-code">Copy identifier</Label><Input id="copy-code" autoFocus value={code} onChange={(event) => setCode(event.target.value)} /></div><Button disabled={processing || !code.trim()}>Check copy</Button>{message && <p className="rounded-lg border bg-muted/40 p-3 text-sm">{message}</p>}</form></CardContent></Card></div></LibraryLayout>;
}
