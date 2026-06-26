import { Head, Link, router } from '@inertiajs/react';

import EmptyState from '@/components/library/EmptyState';
import PageHeader from '@/components/library/PageHeader';
import PaginationLinks from '@/components/PaginationLinks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface ArchivedBookRow {
    id: number;
    title_statement: string;
    main_author: string | null;
    pub_year: string | null;
    archived_at: string | null;
}

interface ArchivedProps extends PageProps {
    books: Paginated<ArchivedBookRow>;
}

export default function Archived({ books }: ArchivedProps) {
    const unarchiveBook = (bookId: number) => {
        router.post(`/books/${bookId}/unarchive`);
    };

    return (
        <LibraryLayout>
            <Head title="Archived Books" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Catalog"
                    title="Archived books"
                    description="View catalog records that were archived but not soft-deleted."
                    actions={
                        <>
                            <Link href="/books">
                                <Button variant="outline" size="sm">
                                    Back to books
                                </Button>
                            </Link>
                            <Link href="/staff/books/trash">
                                <Button variant="outline" size="sm">
                                    Trash
                                </Button>
                            </Link>
                        </>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Archived catalog records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {books.data.length === 0 ? (
                            <EmptyState title="No archived books" description="Archive a book from catalog actions to see it here." />
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Author</TableHead>
                                            <TableHead>Year</TableHead>
                                            <TableHead>Archived at</TableHead>
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
                                                    {book.archived_at
                                                        ? new Date(book.archived_at).toLocaleString('en-PH')
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/book/${book.id}`}>
                                                            <Button size="sm" variant="outline">
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => unarchiveBook(book.id)}
                                                        >
                                                            Unarchive
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
