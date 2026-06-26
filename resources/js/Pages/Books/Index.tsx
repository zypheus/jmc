import { Head, Link, router } from '@inertiajs/react';
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

interface LibraryProgram {
    id: number;
    program_name: string;
}

interface BookRow {
    title_statement: string;
    main_author: string;
    pub_year: number | null;
    content_type: string | null;
    copies: number;
    sample_id: number;
    availability: string | null;
}

interface CatalogFilters {
    show_all: boolean;
    search: string;
    program: string;
    year_filter: string;
    year1: string;
    year2: string;
    status: string;
    per_page: string;
}

interface IndexProps extends PageProps {
    library_books: Paginated<BookRow>;
    library_programs: LibraryProgram[];
    filters: CatalogFilters;
    hasActiveQuery: boolean;
}

function availabilityTone(availability: string | null) {
    if (availability === 'Available') return 'available';
    if (availability === 'Borrowed') return 'borrowed';
    if (availability === 'Reserved') return 'reserved';
    return 'pending';
}

export default function Index({
    library_books,
    library_programs,
    filters,
    hasActiveQuery,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [program, setProgram] = useState(filters.program ?? '');
    const [yearFilter, setYearFilter] = useState(filters.year_filter ?? '');
    const [year1, setYear1] = useState(filters.year1 ?? '');
    const [year2, setYear2] = useState(filters.year2 ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilters(event: FormEvent, showAll = false) {
        event.preventDefault();
        router.get(
            '/books',
            {
                search: search || undefined,
                program: program || undefined,
                year_filter: yearFilter || undefined,
                year1: year1 || undefined,
                year2: year2 || undefined,
                status: status || undefined,
                show_all: showAll ? 1 : undefined,
            },
            { preserveState: true },
        );
    }

    return (
        <LibraryLayout>
            <Head title="Library Catalog" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Library"
                    title="Library catalog"
                    description="Search and browse library books."
                    actions={
                        <>
                            <Link href="/dashboard/library-admin">
                                <Button variant="outline" size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                        </>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
                    <FilterSidebarCard title="Search catalog">
                        <form onSubmit={(e) => applyFilters(e)} className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <Input
                                    id="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Title, author, ISBN..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="program">Program</Label>
                                <select
                                    id="program"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={program}
                                    onChange={(e) => setProgram(e.target.value)}
                                >
                                    <option value="">All programs</option>
                                    {library_programs.map((p) => (
                                        <option key={p.id} value={String(p.id)}>
                                            {p.program_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Availability</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="">Any</option>
                                    <option value="Available">Available</option>
                                    <option value="Borrowed">Borrowed</option>
                                    <option value="Reserved">Reserved</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year_filter">Publication year</Label>
                                <select
                                    id="year_filter"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                >
                                    <option value="">Any year</option>
                                    <option value="exact">Exact</option>
                                    <option value="before">Before</option>
                                    <option value="after">After</option>
                                    <option value="between">Between</option>
                                </select>
                            </div>
                            {yearFilter && (
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="year1">Year{yearFilter === 'between' ? ' (from)' : ''}</Label>
                                        <Input
                                            id="year1"
                                            type="number"
                                            value={year1}
                                            onChange={(e) => setYear1(e.target.value)}
                                        />
                                    </div>
                                    {yearFilter === 'between' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="year2">Year (to)</Label>
                                            <Input
                                                id="year2"
                                                type="number"
                                                value={year2}
                                                onChange={(e) => setYear2(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Button type="submit" size="sm">
                                    Search
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={(e) => applyFilters(e, true)}>
                                    Show all
                                </Button>
                            </div>
                        </form>
                    </FilterSidebarCard>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {hasActiveQuery
                                    ? `${library_books.total} result${library_books.total === 1 ? '' : 's'}`
                                    : 'Catalog results'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!hasActiveQuery ? (
                                <EmptyState
                                    title="Search to begin"
                                    description="Enter search criteria on the left or click Show all to browse the catalog."
                                    actionLabel="Show all books"
                                    onAction={() =>
                                        router.get('/books', { show_all: 1 }, { preserveState: true })
                                    }
                                />
                            ) : library_books.data.length === 0 ? (
                                <EmptyState
                                    title="No books found"
                                    description="Try adjusting filters to find matching catalog records."
                                />
                            ) : (
                                <>
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
                                            {library_books.data.map((book) => (
                                                <TableRow key={book.sample_id}>
                                                    <TableCell>{book.title_statement}</TableCell>
                                                    <TableCell>{book.main_author}</TableCell>
                                                    <TableCell>{book.pub_year ?? '—'}</TableCell>
                                                    <TableCell>{book.content_type ?? '—'}</TableCell>
                                                    <TableCell>{book.copies}</TableCell>
                                                    <TableCell>
                                                        {book.copies === 1 ? (
                                                            <StatusBadge tone={availabilityTone(book.availability)}>
                                                                {book.availability ?? 'Unknown'}
                                                            </StatusBadge>
                                                        ) : (
                                                            <span>{book.copies} copies</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <PaginationLinks links={library_books.links} />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </LibraryLayout>
    );
}
