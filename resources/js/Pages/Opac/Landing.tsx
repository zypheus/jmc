import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

import PaginationLinks from '@/components/PaginationLinks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GuestLayout from '@/Layouts/GuestLayout';
import type { PageProps, Paginated } from '@/types';

interface CarouselBook {
    id: number;
    title_statement: string;
    main_author: string | null;
    cover_image: string | null;
}

interface LibraryBookRow {
    id: number;
    title_statement: string;
    main_author: string | null;
    pub_year: number | null;
    copies: number;
    is_available: number;
    content_type: string | null;
}

interface LibraryEbookRow {
    id: number;
    title: string;
    author: string | null;
    publication_year: string | null;
    source: string | null;
    link: string | null;
}

interface FiltersPayload {
    subjectTopics: string[];
    genres: string[];
    sections: string[];
    courses: string[];
    contentTypes: string[];
    search: string;
    viewMode: 'books' | 'ebooks';
    searchActive: boolean;
}

interface LandingProps extends PageProps {
    carouselBooks: CarouselBook[];
    carouselMeta: Record<number, { copies: number; is_available: boolean }>;
    libraryBooks: Paginated<LibraryBookRow>;
    libraryEbooks: Paginated<LibraryEbookRow> | null;
    filters: FiltersPayload;
}

export default function Landing({ carouselBooks, carouselMeta, libraryBooks, libraryEbooks, filters }: LandingProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const tabsValue = filters.viewMode === 'ebooks' ? 'ebooks' : 'books';
    const resultCount = tabsValue === 'ebooks' ? (libraryEbooks?.total ?? 0) : libraryBooks.total;

    const searchParams = useMemo(
        () => ({
            search: search || undefined,
            view: tabsValue,
        }),
        [search, tabsValue],
    );

    function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/opac', searchParams);
    }

    function switchView(next: string) {
        router.get('/opac', {
            search: filters.search || undefined,
            view: next,
        });
    }

    return (
        <GuestLayout>
            <Head title="OPAC" />

            <div className="space-y-6">
                <Card className="border-primary/25 bg-gradient-to-r from-primary/10 via-background to-background">
                    <CardHeader>
                        <CardTitle className="text-2xl">JMC Library OPAC</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Search books and e-books in the Jose Maria College catalog.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={onSearchSubmit} className="flex flex-col gap-2 sm:flex-row">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by title, author, keyword…"
                            />
                            <Button type="submit">Search</Button>
                        </form>
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">
                                Staff access is available from the login page.
                            </p>
                            <Link href="/login">
                                <Button size="sm" variant="outline">
                                    Staff Login
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Featured books</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {carouselBooks.map((book) => {
                            const meta = carouselMeta[book.id] ?? { copies: 1, is_available: false };
                            return (
                                <Card key={book.id}>
                                    <CardContent className="space-y-2 p-4">
                                        <p className="line-clamp-2 text-sm font-semibold">{book.title_statement}</p>
                                        <p className="line-clamp-1 text-xs text-muted-foreground">
                                            {book.main_author ?? 'Unknown author'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">{meta.copies} copies</Badge>
                                            <Badge variant={meta.is_available ? 'default' : 'outline'}>
                                                {meta.is_available ? 'Available' : 'Not available'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </CardContent>
                </Card>

                <Tabs value={tabsValue} onValueChange={switchView}>
                    <TabsList>
                        <TabsTrigger value="books">Books</TabsTrigger>
                        <TabsTrigger value="ebooks">E-Books</TabsTrigger>
                    </TabsList>

                    <TabsContent value="books" className="space-y-4">
                        {filters.searchActive && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Book results ({libraryBooks.total})</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Author</TableHead>
                                                <TableHead>Year</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Copies</TableHead>
                                                <TableHead>Availability</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {libraryBooks.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                        No matching books found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                libraryBooks.data.map((book) => (
                                                    <TableRow key={book.id}>
                                                        <TableCell>{book.title_statement}</TableCell>
                                                        <TableCell>{book.main_author ?? '—'}</TableCell>
                                                        <TableCell>{book.pub_year ?? '—'}</TableCell>
                                                        <TableCell>{book.content_type ?? '—'}</TableCell>
                                                        <TableCell>{book.copies}</TableCell>
                                                        <TableCell>
                                                            {book.is_available === 1 ? 'Available' : 'Not available'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                    <PaginationLinks links={libraryBooks.links} />
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="ebooks" className="space-y-4">
                        {filters.searchActive && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>E-Book results ({resultCount})</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {(libraryEbooks?.data ?? []).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No matching e-books found.</p>
                                    ) : (
                                        (libraryEbooks?.data ?? []).map((ebook) => (
                                            <Card key={ebook.id}>
                                                <CardContent className="flex items-center justify-between gap-3 p-4">
                                                    <div>
                                                        <p className="font-medium">{ebook.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {ebook.author ?? 'Unknown author'}
                                                            {ebook.publication_year
                                                                ? ` · ${ebook.publication_year}`
                                                                : ''}
                                                            {ebook.source ? ` · ${ebook.source}` : ''}
                                                        </p>
                                                    </div>
                                                    {ebook.link && (
                                                        <a href={ebook.link} target="_blank" rel="noreferrer">
                                                            <Button size="sm" variant="outline">
                                                                Open
                                                            </Button>
                                                        </a>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                    {libraryEbooks && <PaginationLinks links={libraryEbooks.links} />}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </GuestLayout>
    );
}
