import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import ConfirmActionDialog from '@/components/library/ConfirmActionDialog';
import EmptyState from '@/components/library/EmptyState';
import PageHeader from '@/components/library/PageHeader';
import PaginationLinks from '@/components/PaginationLinks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface TrashedBookRow {
    id: number;
    title_statement: string;
    main_author: string | null;
    pub_year: string | null;
    deleted_at: string | null;
}

interface TrashProps extends PageProps {
    books: Paginated<TrashedBookRow>;
}

type PendingTrashAction = { type: 'restore' | 'force-delete'; book: TrashedBookRow } | null;

export default function Trash({ books }: TrashProps) {
    const [pendingAction, setPendingAction] = useState<PendingTrashAction>(null);

    const confirmPendingAction = () => {
        if (!pendingAction) return;

        if (pendingAction.type === 'restore') {
            router.post(`/books/${pendingAction.book.id}/restore`);
        } else {
            router.delete(`/books/${pendingAction.book.id}/force-delete`);
        }
        setPendingAction(null);
    };

    return (
        <LibraryLayout>
            <Head title="Book Trash" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Catalog"
                    title="Trash"
                    description="Soft-deleted books can be restored or permanently removed."
                    actions={
                        <>
                            <Link href="/books">
                                <Button variant="outline" size="sm">
                                    Back to books
                                </Button>
                            </Link>
                            <Link href="/staff/books/archived">
                                <Button variant="outline" size="sm">
                                    Archived
                                </Button>
                            </Link>
                        </>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Soft-deleted records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {books.data.length === 0 ? (
                            <EmptyState title="Trash is empty" description="Deleted catalog records will appear here." />
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Author</TableHead>
                                            <TableHead>Year</TableHead>
                                            <TableHead>Deleted at</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {books.data.map((book) => (
                                            <TableRow key={book.id}>
                                                <TableCell>{book.title_statement}</TableCell>
                                                <TableCell>{book.main_author ?? '—'}</TableCell>
                                                <TableCell>{book.pub_year ?? '—'}</TableCell>
                                                <TableCell>
                                                    {book.deleted_at
                                                        ? new Date(book.deleted_at).toLocaleString('en-PH')
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button type="button" size="sm" onClick={() => setPendingAction({ type: 'restore', book })}>
                                                            Restore
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => setPendingAction({ type: 'force-delete', book })}
                                                        >
                                                            Delete forever
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <PaginationLinks links={books.links} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmActionDialog
                open={pendingAction !== null}
                onOpenChange={(open) => !open && setPendingAction(null)}
                title={pendingAction?.type === 'restore' ? 'Restore this book?' : 'Permanently delete this book?'}
                description={pendingAction?.type === 'restore'
                    ? `“${pendingAction.book.title_statement}” will return to the active catalog.`
                    : `“${pendingAction?.book.title_statement ?? 'This book'}” and its catalog record will be permanently deleted. This action cannot be undone.`}
                confirmLabel={pendingAction?.type === 'restore' ? 'Restore Book' : 'Delete Permanently'}
                destructive={pendingAction?.type === 'force-delete'}
                onConfirm={confirmPendingAction}
            />
        </LibraryLayout>
    );
}
