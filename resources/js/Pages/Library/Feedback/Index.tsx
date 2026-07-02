import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import PaginationLinks from '@/components/PaginationLinks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { Paginated } from '@/types';

interface Feedback { id: number; name: string | null; email: string | null; comments: string; created_at: string }
interface Props { feedbacks: Paginated<Feedback>; stats: { total: number; this_week: number; this_month: number }; filters: Record<string, string | null> }

export default function Index({ feedbacks, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const submit = (event: FormEvent) => { event.preventDefault(); router.get('/feedbacks', { ...filters, search }, { preserveState: true }); };
    return <LibraryLayout><Head title="Student Feedback" /><div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Student Feedback</h1><p className="text-muted-foreground">Comments submitted through the public form.</p></div><div className="flex gap-2"><Button asChild variant="outline"><a href="/feedback" target="_blank" rel="noreferrer">Public form</a></Button><Button asChild><a href={`/feedbacks/export/csv?${new URLSearchParams(Object.entries(filters).filter(([, value]) => value).map(([key, value]) => [key, value ?? ''])).toString()}`}>Export CSV</a></Button></div></div><div className="grid gap-3 sm:grid-cols-3">{[['All time', stats.total], ['This week', stats.this_week], ['This month', stats.this_month]].map(([label, value]) => <Card key={label}><CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{value}</CardContent></Card>)}</div><Card><CardContent className="pt-6"><form onSubmit={submit} className="flex gap-2"><div className="flex-1 space-y-2"><Label htmlFor="search" className="sr-only">Search</Label><Input id="search" placeholder="Search name, email, or comment" value={search} onChange={(event) => setSearch(event.target.value)} /></div><Button>Search</Button></form></CardContent></Card><Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead>From</TableHead><TableHead>Comment</TableHead><TableHead>Submitted</TableHead></TableRow></TableHeader><TableBody>{feedbacks.data.map((feedback) => <TableRow key={feedback.id}><TableCell><p className="font-medium">{feedback.name || 'Anonymous'}</p><p className="text-xs text-muted-foreground">{feedback.email}</p></TableCell><TableCell className="max-w-xl whitespace-normal">{feedback.comments}</TableCell><TableCell>{new Date(feedback.created_at).toLocaleString()}</TableCell></TableRow>)}</TableBody></Table><PaginationLinks links={feedbacks.links} /></CardContent></Card></div></LibraryLayout>;
}
