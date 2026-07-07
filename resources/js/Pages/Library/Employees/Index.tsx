import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface LibraryProgram {
    id: number;
    program_code: string;
    program_name: string;
}

interface EmployeeRow {
    id: number;
    firstname: string;
    lastname: string;
    employee_id: string;
    designation: string | null;
    program: string | null;
    department: string | null;
    year_start_work: string | null;
    qrcode: string | null;
}

interface IndexProps extends PageProps {
    employees: Paginated<EmployeeRow>;
    libraryPrograms: LibraryProgram[];
    workStartYears: number[];
    pendingRegistrationsCount: number;
    filters: {
        search: string;
        program: string;
        year_start_work: string;
    };
}

function Pagination({ links }: { links: Paginated<unknown>['links'] }) {
    return (
        <div className="mt-4 flex flex-wrap gap-1">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        className={`rounded border px-3 py-1 text-sm ${
                            link.active ? 'border-primary bg-primary text-primary-foreground' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={index}
                        className="px-3 py-1 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}

export default function Index({
    employees,
    libraryPrograms,
    workStartYears,
    pendingRegistrationsCount,
    filters,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [program, setProgram] = useState(filters.program ?? '');
    const [yearStartWork, setYearStartWork] = useState(filters.year_start_work ?? '');

    function applyFilters(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/employees',
            {
                search: search || undefined,
                program: program || undefined,
                year_start_work: yearStartWork || undefined,
            },
            { preserveState: true },
        );
    }

    function clearFilters() {
        setSearch('');
        setProgram('');
        setYearStartWork('');
        router.get('/employees', {}, { preserveState: true });
    }

    return (
        <LibraryLayout>
            <Head title="Library Employees" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Employee patrons</h1>
                    <p className="text-sm text-muted-foreground">{employees.total} registered employees</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {pendingRegistrationsCount > 0 && (
                        <Link href="/pending?tab=library_employees">
                            <Button variant="outline" size="sm">
                                Pending ({pendingRegistrationsCount})
                            </Button>
                        </Link>
                    )}
                    <a href="/employees/create">
                        <Button size="sm">Add employee</Button>
                    </a>
                    <Link href="/students">
                        <Button variant="outline" size="sm">
                            Students
                        </Button>
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
                                placeholder="Name, ID, designation…"
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
                                <option value="">All</option>
                                {libraryPrograms.map((p) => (
                                    <option key={p.id} value={p.program_code}>
                                        {p.program_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year_start_work">Year started</Label>
                            <select
                                id="year_start_work"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={yearStartWork}
                                onChange={(e) => setYearStartWork(e.target.value)}
                            >
                                <option value="">All</option>
                                {workStartYears.map((y) => (
                                    <option key={y} value={String(y)}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-wrap items-end gap-2">
                            <Button type="submit">Apply</Button>
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="overflow-x-auto pt-6">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="pb-2 pr-3 font-medium">Name</th>
                                <th className="pb-2 pr-3 font-medium">Employee ID</th>
                                <th className="pb-2 pr-3 font-medium">Designation</th>
                                <th className="pb-2 pr-3 font-medium">Program</th>
                                <th className="pb-2 pr-3 font-medium">QR</th>
                                <th className="pb-2 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No employees found.
                                    </td>
                                </tr>
                            ) : (
                                employees.data.map((e) => (
                                    <tr key={e.id} className="border-b last:border-0">
                                        <td className="py-2 pr-3">
                                            {e.lastname}, {e.firstname}
                                        </td>
                                        <td className="py-2 pr-3">{e.employee_id}</td>
                                        <td className="py-2 pr-3">{e.designation ?? '—'}</td>
                                        <td className="py-2 pr-3">{e.program ?? e.department ?? '—'}</td>
                                        <td className="py-2 pr-3 font-mono text-xs">{e.qrcode ?? '—'}</td>
                                        <td className="py-2">
                                            <a href={`/employees/edit/${e.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <Pagination links={employees.links} />
                </CardContent>
            </Card>
        </LibraryLayout>
    );
}
