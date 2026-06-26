import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import EmptyState from '@/components/library/EmptyState';
import FilterSidebarCard from '@/components/library/FilterSidebarCard';
import PageHeader from '@/components/library/PageHeader';
import StatusBadge from '@/components/library/StatusBadge';
import PaginationLinks from '@/components/PaginationLinks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface BookSummary {
    id: number;
    title_statement: string;
    accession_no: string | null;
}

interface FineLogRow {
    id: number;
    patron_name: string | null;
    fine_incurred: string | null;
    fine_balance: string | null;
    returned_date: string | null;
    book: BookSummary | null;
}

interface OutstandingProps extends PageProps {
    logs: Paginated<FineLogRow>;
    totalOutstanding: number;
    filters: { search: string };
}

function remainingFine(log: FineLogRow): number {
    if (log.fine_balance !== null && log.fine_balance !== '') {
        return parseFloat(log.fine_balance);
    }
    return parseFloat(log.fine_incurred ?? '0');
}

export default function Outstanding({ logs, totalOutstanding, filters }: OutstandingProps) {
    const { flash } = usePage<OutstandingProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [clearingId, setClearingId] = useState<number | null>(null);

    const clearForm = useForm({
        fine_clearance_type: 'paid' as 'paid' | 'waived',
        fine_clearance_amount: '',
        fine_clearance_note: '',
    });

    function applySearch(e: FormEvent) {
        e.preventDefault();
        router.get('/admin/fines/outstanding', { search: search || undefined }, { preserveState: true });
    }

    function openClear(log: FineLogRow) {
        setClearingId(log.id);
        clearForm.setData({
            fine_clearance_type: 'paid',
            fine_clearance_amount: remainingFine(log).toFixed(2),
            fine_clearance_note: '',
        });
    }

    function submitClear(e: FormEvent) {
        e.preventDefault();
        if (clearingId === null) {
            return;
        }
        clearForm.post(`/admin/fines/logs/${clearingId}/clear`, {
            preserveScroll: true,
            onSuccess: () => setClearingId(null),
        });
    }

    return (
        <LibraryLayout>
            <Head title="Outstanding Fines" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Library"
                    title="Outstanding fines"
                    description={`Total outstanding: PHP ${totalOutstanding.toFixed(2)}`}
                    actions={
                        <>
                            <Link href="/admin/circulation-policy">
                                <Button variant="outline" size="sm">
                                    Policy settings
                                </Button>
                            </Link>
                            <Link href="/dashboard/library-admin">
                                <Button variant="outline" size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                        </>
                    }
                />

                {flash.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
                    <FilterSidebarCard title="Search fines">
                        <form onSubmit={applySearch} className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search patron or book</Label>
                                <Input
                                    id="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Name, ID, title..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" size="sm">
                                    Search
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        router.get('/admin/fines/outstanding', {}, { preserveState: true });
                                    }}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </FilterSidebarCard>

                    <Card>
                        <CardHeader>
                            <CardTitle>Fines to clear</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {logs.data.length === 0 ? (
                                <EmptyState
                                    title="No outstanding fines"
                                    description="All tracked fines are already settled."
                                />
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Patron</TableHead>
                                                <TableHead>Book</TableHead>
                                                <TableHead>Returned</TableHead>
                                                <TableHead>Fine</TableHead>
                                                <TableHead>Remaining</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.data.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell>{log.patron_name ?? '—'}</TableCell>
                                                    <TableCell>{log.book?.title_statement ?? '—'}</TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {log.returned_date
                                                            ? new Date(log.returned_date).toLocaleDateString('en-PH')
                                                            : '—'}
                                                    </TableCell>
                                                    <TableCell>PHP {log.fine_incurred ?? '0.00'}</TableCell>
                                                    <TableCell>PHP {remainingFine(log).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <StatusBadge tone="overdue">Outstanding</StatusBadge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm" onClick={() => openClear(log)}>
                                                            Clear
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <PaginationLinks links={logs.links} />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {clearingId !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Clear fine</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitClear} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fine_clearance_type">Type</Label>
                                        <select
                                            id="fine_clearance_type"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={clearForm.data.fine_clearance_type}
                                            onChange={(e) =>
                                                clearForm.setData('fine_clearance_type', e.target.value as 'paid' | 'waived')
                                            }
                                        >
                                            <option value="paid">Payment</option>
                                            <option value="waived">Waiver</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fine_clearance_amount">Amount (PHP)</Label>
                                        <Input
                                            id="fine_clearance_amount"
                                            type="number"
                                            min={0.01}
                                            step="0.01"
                                            value={clearForm.data.fine_clearance_amount}
                                            onChange={(e) => clearForm.setData('fine_clearance_amount', e.target.value)}
                                            required
                                        />
                                        {clearForm.errors.fine_clearance_amount && (
                                            <p className="text-sm text-destructive">{clearForm.errors.fine_clearance_amount}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fine_clearance_note">Note (optional)</Label>
                                        <Input
                                            id="fine_clearance_note"
                                            value={clearForm.data.fine_clearance_note}
                                            onChange={(e) => clearForm.setData('fine_clearance_note', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setClearingId(null)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={clearForm.processing}>
                                            {clearForm.processing ? 'Saving…' : 'Record clearance'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </LibraryLayout>
    );
}
