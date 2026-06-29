import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LibraryLayout from '@/Layouts/LibraryLayout';

export default function Search({ prefillIsbn }: { prefillIsbn: string }) {
    const form = useForm({ isbn: prefillIsbn });
    const submit = (event: FormEvent) => { event.preventDefault(); form.post('/catalog/copy/openlibrary/search'); };
    return <LibraryLayout><Head title="Copy Cataloging" /><div className="mx-auto max-w-xl space-y-6"><div><h1 className="text-2xl font-semibold">Copy Cataloging by ISBN</h1><p className="text-muted-foreground">Lookup checks Open Library first, then Google Books.</p></div><Card><CardHeader><CardTitle>Find a bibliographic record</CardTitle><CardDescription>Enter an ISBN with or without hyphens.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="isbn">ISBN</Label><Input id="isbn" value={form.data.isbn} onChange={(event) => form.setData('isbn', event.target.value)} autoFocus />{form.errors.isbn && <p className="text-sm text-destructive">{form.errors.isbn}</p>}</div><Button disabled={form.processing}>Search catalog sources</Button></form></CardContent></Card></div></LibraryLayout>;
}
