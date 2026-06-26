import { Head, Link, router } from '@inertiajs/react';

import EmptyState from '@/components/library/EmptyState';
import PageHeader from '@/components/library/PageHeader';
import PaginationLinks from '@/components/PaginationLinks';
import StatusBadge from '@/components/library/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface CopyRow {
    id: number;
    accession_no: string | null;
    barcode: string | null;
    rfid: string | null;
    availability: string | null;
    title_statement: string;
    created_at: string | null;
}

interface CopiesStaffProps extends PageProps {
    copies: Paginated<CopyRow>;
    title: string;
    author: string;
    year: string;
}

function availabilityTone(availability: string | null) {
    if (availability === 'Available') return 'available';
    if (availability === 'Borrowed') return 'borrowed';
    return 'pending';
}

export default function CopiesStaff({ copies, title, author, year }: CopiesStaffProps) {
    const deleteCopy = (copyId: number) => {
        if (!window.confirm('Delete this copy?')) {
            return;
        }
        router.delete(`/books/${copyId}`);
    };

    return (
        <LibraryLayout>
            <Head title="Book Copies" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Catalog"
                    title={`Copies of ${title}`}
                    description={`${author} — ${year}`}
                    actions={
                        <>
                            <Link href="/books">
                                <Button variant="outline" size="sm">
                                    Back to books
                                </Button>
                            </Link>
                            <Link href="/books">
                                <Button variant="outline" size="sm">
                                    Previous page
                                </Button>
                            </Link>
                        </>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Grouped copies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {copies.data.length === 0 ? (
                            <EmptyState title="No copies found" description="No catalog copies match this grouped title." />
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Accession no.</TableHead>
                                            <TableHead>Barcode</TableHead>
                                            <TableHead>RFID</TableHead>
                                            <TableHead>Availability</TableHead>
                                            <TableHead>Date added</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {copies.data.map((copy) => (
                                            <TableRow key={copy.id}>
                                                <TableCell>{copy.accession_no ?? '—'}</TableCell>
                                                <TableCell>{copy.barcode ?? '—'}</TableCell>
                                                <TableCell>{copy.rfid ?? '—'}</TableCell>
                                                <TableCell>
                                                    <StatusBadge tone={availabilityTone(copy.availability)}>
                                                        {copy.availability ?? 'Unknown'}
                                                    </StatusBadge>
                                                </TableCell>
                                                <TableCell>
                                                    {copy.created_at
                                                        ? new Date(copy.created_at).toLocaleDateString('en-PH')
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/book/${copy.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/book/${copy.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => deleteCopy(copy.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <PaginationLinks links={copies.links} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
