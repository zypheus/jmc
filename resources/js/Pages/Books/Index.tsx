import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

import CatalogWelcomePanel from '@/components/library/CatalogWelcomePanel';
import FilterSidebarCard from '@/components/library/FilterSidebarCard';
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
    auth,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [program, setProgram] = useState(filters.program ?? '');
    const [yearFilter, setYearFilter] = useState(filters.year_filter ?? '');
    const [year1, setYear1] = useState(filters.year1 ?? '');
    const [year2, setYear2] = useState(filters.year2 ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const canManageBooks = auth.isSuperAdmin || (auth.user?.roles.includes('library_admin') ?? false);

    function deleteBook(book: BookRow) {
        if (!window.confirm(`Move "${book.title_statement}" to Trash?`)) {
            return;
        }

        router.delete(`/book/${book.sample_id}`, {
            preserveScroll: true,
        });
    }

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
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#23408E]">
                            Catalog
                        </p>
                        <h1 className="text-2xl font-semibold">Library catalog</h1>
                        <p className="text-sm text-muted-foreground">Search and browse library books.</p>
                    </div>
                    <Link href="/dashboard/library-admin">
                        <Button variant="outline" size="sm" className="rounded-[10px]">
                            Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
                    <FilterSidebarCard title="Find books">
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
                                <Button type="submit" size="sm" className="rounded-[10px]">
                                    Search
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-[10px]"
                                    onClick={(e) => applyFilters(e, true)}
                                >
                                    Show all
                                </Button>
                            </div>
                        </form>
                    </FilterSidebarCard>

                    <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
                        <CardHeader className="border-b border-[#E5E7EB]">
                            <CardTitle>
                                {hasActiveQuery
                                    ? `${library_books.total} result${library_books.total === 1 ? '' : 's'}`
                                    : 'Catalog results'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {!hasActiveQuery ? (
                                <CatalogWelcomePanel />
                            ) : library_books.data.length === 0 ? (
                                <div className="py-10 text-center">
                                    <p className="font-medium">No books found</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Try adjusting filters to find matching catalog records.
                                    </p>
                                </div>
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
                                                {canManageBooks && <TableHead className="text-right">Actions</TableHead>}
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
                                                    {canManageBooks && (
                                                        <TableCell>
                                                            <div className="flex justify-end gap-2">
                                                                <Button asChild variant="outline" size="sm">
                                                                    <Link href={`/book/${book.sample_id}/edit`}>
                                                                        <Pencil className="size-4" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => deleteBook(book)}
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
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
