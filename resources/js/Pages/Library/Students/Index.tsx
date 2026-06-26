import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

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
    program_code: string;
    program_name: string;
}

interface StudentRow {
    id: number;
    firstname: string;
    lastname: string;
    id_number: string;
    course: string | null;
    year: string | null;
    qrcode: string | null;
    mobile_number: string | null;
}

interface IndexProps extends PageProps {
    students: Paginated<StudentRow>;
    libraryPrograms: LibraryProgram[];
    pendingEditsCount: number;
    pendingRegistrationsCount: number;
    filters: {
        search: string;
        course: string;
        year: string;
        program_id: string;
    };
}

export default function Index({
    students,
    libraryPrograms,
    pendingEditsCount,
    pendingRegistrationsCount,
    filters,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [course, setCourse] = useState(filters.course ?? '');
    const [year, setYear] = useState(filters.year ?? '');

    function applyFilters(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/students',
            {
                search: search || undefined,
                course: course || undefined,
                year: year || undefined,
            },
            { preserveState: true },
        );
    }

    function clearFilters() {
        setSearch('');
        setCourse('');
        setYear('');
        router.get('/students', {}, { preserveState: true });
    }

    return (
        <LibraryLayout>
            <Head title="Library Students" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Student patrons</h1>
                    <p className="text-sm text-muted-foreground">{students.total} registered students</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {pendingRegistrationsCount > 0 && (
                        <Link href="/pending">
                            <Button variant="outline" size="sm">
                                Pending ({pendingRegistrationsCount})
                            </Button>
                        </Link>
                    )}
                    {pendingEditsCount > 0 && (
                        <Link href="/student/pending-requests">
                            <Button variant="outline" size="sm">
                                Edit requests ({pendingEditsCount})
                            </Button>
                        </Link>
                    )}
                    <Link href="/students/create">
                        <Button size="sm">Add student</Button>
                    </Link>
                    <Link href="/dashboard/library-admin">
                        <Button variant="outline" size="sm">
                            Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Search & filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={applyFilters} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Name, ID, QR…"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="course">Course / program</Label>
                            <select
                                id="course"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                            >
                                <option value="">All</option>
                                {libraryPrograms.map((p) => (
                                    <option key={p.id} value={p.program_code}>
                                        {p.program_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Year level</Label>
                            <Input
                                id="year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="e.g. 1st Year"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button type="submit">Apply</Button>
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>ID number</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>QR</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.data.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            {s.lastname}, {s.firstname}
                                        </TableCell>
                                        <TableCell>{s.id_number}</TableCell>
                                        <TableCell>{s.course ?? '—'}</TableCell>
                                        <TableCell>{s.year ?? '—'}</TableCell>
                                        <TableCell className="font-mono text-xs">{s.qrcode ?? '—'}</TableCell>
                                        <TableCell>
                                            <Link href={`/students/${s.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <PaginationLinks links={students.links} />
                </CardContent>
            </Card>
        </LibraryLayout>
    );
}
