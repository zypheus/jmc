import { Head, Link, router } from '@inertiajs/react';

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

export default function Trash({ books }: TrashProps) {
    const restoreBook = (bookId: number) => {
        router.post(`/books/${bookId}/restore`);
    };

    const forceDeleteBook = (bookId: number) => {
        if (!window.confirm('Permanently delete this book? This cannot be undone.')) {
            return;
        }
        router.delete(`/books/${bookId}/force-delete`);
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
                                                        <Button type="button" size="sm" onClick={() => restoreBook(book.id)}>
                                                            Restore
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => forceDeleteBook(book.id)}
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
        </LibraryLayout>
    );
}
