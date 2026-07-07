import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

import EmptyState from '@/components/library/EmptyState';
import FilterSidebarCard from '@/components/library/FilterSidebarCard';
import PageHeader from '@/components/library/PageHeader';
import PaginationLinks from '@/components/PaginationLinks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface ProgramOption {
    id: number;
    program_name: string;
}

interface CourseOption {
    id: number;
    course_name: string;
}

interface EbookRow {
    id: number;
    title: string;
    author: string;
    publication_year: string | null;
    publisher: string | null;
    source: string | null;
    link: string | null;
    program: ProgramOption | null;
    course: CourseOption | null;
}

interface Filters {
    title: string;
    author: string;
    year: string;
    publisher: string;
    source: string;
    program_id: string;
    course_id: string;
}

interface EbooksIndexProps extends PageProps {
    library_ebooks: Paginated<EbookRow>;
    totalCount: number;
    allTitles: string[];
    allAuthors: string[];
    allYears: string[];
    allPublishers: string[];
    allSources: string[];
    allPrograms: ProgramOption[];
    allCourses: CourseOption[];
    filters: Filters;
}

function hasActiveFilters(filters: Filters) {
    return Object.values(filters).some((value) => value !== '');
}

export default function Index({
    library_ebooks,
    totalCount,
    allTitles,
    allAuthors,
    allYears,
    allPublishers,
    allSources,
    allPrograms,
    allCourses,
    filters,
}: EbooksIndexProps) {
    const [localFilters, setLocalFilters] = useState<Filters>(filters);
    const activeFilters = useMemo(() => hasActiveFilters(localFilters), [localFilters]);

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/ebooks',
            {
                title: localFilters.title || undefined,
                author: localFilters.author || undefined,
                year: localFilters.year || undefined,
                publisher: localFilters.publisher || undefined,
                source: localFilters.source || undefined,
                program_id: localFilters.program_id || undefined,
                course_id: localFilters.course_id || undefined,
            },
            { preserveState: true },
        );
    };

    const clearFilters = () => {
        setLocalFilters({
            title: '',
            author: '',
            year: '',
            publisher: '',
            source: '',
            program_id: '',
            course_id: '',
        });
        router.get('/ebooks');
    };

    const removeEbook = (ebookId: number) => {
        if (!window.confirm('Delete this e-resource?')) {
            return;
        }
        router.delete(`/ebooks/${ebookId}`);
    };

    return (
        <LibraryLayout>
            <Head title="E-Resources" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Digital library"
                    title="E-Resources collection"
                    description="Journals, e-books, and online materials linked to programs and subjects."
                    actions={
                        <>
                            <Link href="/books">
                                <Button variant="outline" size="sm">
                                    Catalog
                                </Button>
                            </Link>
                            <Link href="/ebooks/create">
                                <Button size="sm">Add e-resource</Button>
                            </Link>
                        </>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
                    <FilterSidebarCard title="Filter collection">
                        <form onSubmit={applyFilters} className="space-y-3">
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium">
                                    Title
                                </label>
                                <select
                                    id="title"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={localFilters.title}
                                    onChange={(event) => setLocalFilters((prev) => ({ ...prev, title: event.target.value }))}
                                >
                                    <option value="">All titles</option>
                                    {allTitles.map((title) => (
                                        <option key={title} value={title}>
                                            {title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="author" className="text-sm font-medium">
                                    Author
                                </label>
                                <select
                                    id="author"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={localFilters.author}
                                    onChange={(event) => setLocalFilters((prev) => ({ ...prev, author: event.target.value }))}
                                >
                                    <option value="">All authors</option>
                                    {allAuthors.map((author) => (
                                        <option key={author} value={author}>
                                            {author}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="year" className="text-sm font-medium">
                                    Publication year
                                </label>
                                <select
                                    id="year"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={localFilters.year}
                                    onChange={(event) => setLocalFilters((prev) => ({ ...prev, year: event.target.value }))}
                                >
                                    <option value="">All years</option>
                                    {allYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="publisher" className="text-sm font-medium">
                                    Publisher
                                </label>
                                <select
                                    id="publisher"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={localFilters.publisher}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({ ...prev, publisher: event.target.value }))
                                    }
                                >
                                    <option value="">All publishers</option>
                                    {allPublishers.map((publisher) => (
                                        <option key={publisher} value={publisher}>
                                            {publisher}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="source" className="text-sm font-medium">
                                    Source
                                </label>
                                <select
                                    id="source"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={localFilters.source}
                                    onChange={(event) => setLocalFilters((prev) => ({ ...prev, source: event.target.value }))}
                                >
                                    <option value="">All sources</option>
                                    {allSources.map((source) => (
                                        <option key={source} value={source}>
                                            {source}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="program_id" className="text-sm font-medium">
                                    Program
                                </label>
                                <select
                                    id="program_id"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={localFilters.program_id}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({ ...prev, program_id: event.target.value }))
                                    }
                                >
                                    <option value="">All programs</option>
                                    {allPrograms.map((program) => (
                                        <option key={program.id} value={String(program.id)}>
                                            {program.program_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="course_id" className="text-sm font-medium">
                                    Subject / course
                                </label>
                                <select
                                    id="course_id"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={localFilters.course_id}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({ ...prev, course_id: event.target.value }))
                                    }
                                >
                                    <option value="">All subjects</option>
                                    {allCourses.map((course) => (
                                        <option key={course.id} value={String(course.id)}>
                                            {course.course_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Button type="submit" size="sm">
                                    Apply
                                </Button>
                                {activeFilters && (
                                    <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </form>
                    </FilterSidebarCard>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {library_ebooks.total} matching resource{library_ebooks.total === 1 ? '' : 's'}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">Total in collection: {totalCount}</p>
                        </CardHeader>
                        <CardContent>
                            {library_ebooks.data.length === 0 ? (
                                <EmptyState
                                    title={activeFilters ? 'No e-resources match these filters' : 'No e-resources yet'}
                                    description={
                                        activeFilters
                                            ? 'Adjust filters to see matching resources.'
                                            : 'Add your first e-resource to start the digital collection.'
                                    }
                                    actionLabel={!activeFilters ? 'Add e-resource' : undefined}
                                    onAction={!activeFilters ? () => router.get('/ebooks/create') : undefined}
                                />
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title & author</TableHead>
                                                <TableHead>Year</TableHead>
                                                <TableHead>Publisher</TableHead>
                                                <TableHead>Source</TableHead>
                                                <TableHead>Program</TableHead>
                                                <TableHead>Subject</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {library_ebooks.data.map((ebook) => (
                                                <TableRow key={ebook.id}>
                                                    <TableCell>
                                                        <p className="font-medium">{ebook.title}</p>
                                                        <p className="text-xs text-muted-foreground">{ebook.author}</p>
                                                    </TableCell>
                                                    <TableCell>{ebook.publication_year ?? '—'}</TableCell>
                                                    <TableCell>{ebook.publisher ?? '—'}</TableCell>
                                                    <TableCell>{ebook.source ?? '—'}</TableCell>
                                                    <TableCell>{ebook.program?.program_name ?? '—'}</TableCell>
                                                    <TableCell>{ebook.course?.course_name ?? '—'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-wrap justify-end gap-2">
                                                            {ebook.link && (
                                                                <a href={ebook.link} target="_blank" rel="noreferrer">
                                                                    <Button variant="outline" size="sm">
                                                                        Open
                                                                    </Button>
                                                                </a>
                                                            )}
                                                            <Link href={`/ebooks/${ebook.id}/edit`}>
                                                                <Button variant="outline" size="sm">
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() => removeEbook(ebook.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <PaginationLinks links={library_ebooks.links} />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </LibraryLayout>
    );
}
