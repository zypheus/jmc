import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface PendingStudent {
    id: number;
    firstname: string;
    lastname: string;
    id_number: string;
    course: string | null;
    year: string | null;
    mobile_number: string | null;
    email: string | null;
}

interface PendingEmployee {
    id: number;
    firstname: string;
    lastname: string;
    employee_id: string;
    designation: string | null;
    program: string | null;
    department: string | null;
    mobile_number: string | null;
}

interface IndexProps extends PageProps {
    pendingStudents: Paginated<PendingStudent>;
    pendingEmployees: Paginated<PendingEmployee>;
    defaultTab: 'students' | 'employees';
    filters: { search: string };
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
    pendingStudents,
    pendingEmployees,
    defaultTab,
    filters,
}: IndexProps) {
    const { flash } = usePage<IndexProps>().props;
    const [tab, setTab] = useState<'students' | 'employees'>(defaultTab);
    const [search, setSearch] = useState(filters.search ?? '');

    function applySearch(e: FormEvent) {
        e.preventDefault();
        router.get('/pending', { search: search || undefined, tab: tab === 'employees' ? 'library_employees' : 'students' }, { preserveState: true });
    }

    function switchTab(next: 'students' | 'employees') {
        setTab(next);
        router.get(
            '/pending',
            { search: search || undefined, tab: next === 'employees' ? 'library_employees' : 'students' },
            { preserveState: true },
        );
    }

    function approveStudent(id: number) {
        if (confirm('Approve this student registration?')) {
            router.post(`/admin/pending/${id}/approve`, {}, { preserveScroll: true });
        }
    }

    function rejectStudent(id: number) {
        if (confirm('Reject this student registration?')) {
            router.post(`/admin/pending/${id}/reject`, {}, { preserveScroll: true });
        }
    }

    function approveEmployee(id: number) {
        if (confirm('Approve this employee registration?')) {
            router.post(`/pending/employees/approve/${id}`, {}, { preserveScroll: true });
        }
    }

    function rejectEmployee(id: number) {
        if (confirm('Reject this employee registration?')) {
            router.post(`/pending/employees/reject/${id}`, {}, { preserveScroll: true });
        }
    }

    return (
        <LibraryLayout>
            <Head title="Pending Registrations" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Pending registrations</h1>
                    <p className="text-sm text-muted-foreground">Review and approve library patron sign-ups</p>
                </div>
                <Link href="/dashboard/library-admin">
                    <Button variant="outline" size="sm">
                        Dashboard
                    </Button>
                </Link>
            </div>

            {flash.success && (
                <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    {flash.success}
                </div>
            )}
            {flash.error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {flash.error}
                </div>
            )}

            <Card className="mb-4">
                <CardContent className="pt-6">
                    <form onSubmit={applySearch} className="flex flex-wrap items-end gap-3">
                        <div className="min-w-[200px] flex-1 space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Name, ID, course…"
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="mb-4 flex gap-2">
                <Button
                    type="button"
                    variant={tab === 'students' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => switchTab('students')}
                >
                    Students ({pendingStudents.total})
                </Button>
                <Button
                    type="button"
                    variant={tab === 'employees' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => switchTab('employees')}
                >
                    Employees ({pendingEmployees.total})
                </Button>
            </div>

            {tab === 'students' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending students</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-2 pr-3 font-medium">Name</th>
                                    <th className="pb-2 pr-3 font-medium">ID number</th>
                                    <th className="pb-2 pr-3 font-medium">Course</th>
                                    <th className="pb-2 pr-3 font-medium">Year</th>
                                    <th className="pb-2 pr-3 font-medium">Contact</th>
                                    <th className="pb-2 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingStudents.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No pending student registrations.
                                        </td>
                                    </tr>
                                ) : (
                                    pendingStudents.data.map((s) => (
                                        <tr key={s.id} className="border-b last:border-0">
                                            <td className="py-2 pr-3">
                                                {s.firstname} {s.lastname}
                                            </td>
                                            <td className="py-2 pr-3">{s.id_number}</td>
                                            <td className="py-2 pr-3">{s.course ?? '—'}</td>
                                            <td className="py-2 pr-3">{s.year ?? '—'}</td>
                                            <td className="py-2 pr-3">{s.mobile_number ?? s.email ?? '—'}</td>
                                            <td className="py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={() => approveStudent(s.id)}>
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => rejectStudent(s.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <Pagination links={pendingStudents.links} />
                    </CardContent>
                </Card>
            )}

            {tab === 'employees' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending employees</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-2 pr-3 font-medium">Name</th>
                                    <th className="pb-2 pr-3 font-medium">Employee ID</th>
                                    <th className="pb-2 pr-3 font-medium">Designation</th>
                                    <th className="pb-2 pr-3 font-medium">Program</th>
                                    <th className="pb-2 pr-3 font-medium">Contact</th>
                                    <th className="pb-2 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingEmployees.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No pending employee registrations.
                                        </td>
                                    </tr>
                                ) : (
                                    pendingEmployees.data.map((e) => (
                                        <tr key={e.id} className="border-b last:border-0">
                                            <td className="py-2 pr-3">
                                                {e.firstname} {e.lastname}
                                            </td>
                                            <td className="py-2 pr-3">{e.employee_id}</td>
                                            <td className="py-2 pr-3">{e.designation ?? '—'}</td>
                                            <td className="py-2 pr-3">{e.program ?? e.department ?? '—'}</td>
                                            <td className="py-2 pr-3">{e.mobile_number ?? '—'}</td>
                                            <td className="py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={() => approveEmployee(e.id)}>
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => rejectEmployee(e.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <Pagination links={pendingEmployees.links} />
                    </CardContent>
                </Card>
            )}
        </LibraryLayout>
    );
}
