import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps, Paginated } from '@/types';

interface PendingStudent {
    id: number;
    firstname: string;
    lastname: string;
    course: string | null;
    year: string | null;
    student_id: string | null;
    mobile_number: string | null;
}

interface PendingEmployee {
    id: number;
    firstname: string;
    lastname: string;
    department: string | null;
    position: string | null;
    employee_id: string | null;
}

interface IndexProps extends PageProps {
    pendingStudents: Paginated<PendingStudent>;
    pendingEmployees: Paginated<PendingEmployee>;
    search: string | null;
    tab: string;
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
    search,
    tab,
}: IndexProps) {
    const { flash } = usePage<PageProps>().props;
    const [query, setQuery] = useState(search ?? '');
    const activeTab = tab === 'employees' ? 'employees' : 'students';

    function submitSearch(event: FormEvent) {
        event.preventDefault();
        router.get('/attendance/pending', { search: query || undefined, tab: activeTab }, { preserveState: true });
    }

    function switchTab(nextTab: 'students' | 'employees') {
        router.get('/attendance/pending', { search: query || undefined, tab: nextTab }, { preserveState: true });
    }

    function approveStudent(id: number) {
        if (confirm('Approve this student registration?')) {
            router.post(`/attendance/pending/students/${id}/approve`);
        }
    }

    function rejectStudent(id: number) {
        if (confirm('Reject this student registration?')) {
            router.post(`/attendance/pending/students/${id}/reject`);
        }
    }

    function approveEmployee(id: number) {
        if (confirm('Approve this employee registration?')) {
            router.post(`/attendance/pending/employees/${id}/approve`);
        }
    }

    function rejectEmployee(id: number) {
        if (confirm('Reject this employee registration?')) {
            router.post(`/attendance/pending/employees/${id}/reject`);
        }
    }

    return (
        <AttendanceLayout>
            <Head title="Pending Registrations" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Pending Registrations</h1>
                    <p className="text-muted-foreground">Review and approve patron registration requests.</p>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}

                <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[200px] flex-1 space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <Input
                            id="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Name, course, department..."
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={activeTab === 'students' ? 'default' : 'outline'}
                        onClick={() => switchTab('students')}
                    >
                        Students ({pendingStudents.total})
                    </Button>
                    <Button
                        variant={activeTab === 'employees' ? 'default' : 'outline'}
                        onClick={() => switchTab('employees')}
                    >
                        Employees ({pendingEmployees.total})
                    </Button>
                </div>

                {activeTab === 'students' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-2 font-medium">Name</th>
                                            <th className="pb-2 font-medium">Student ID</th>
                                            <th className="pb-2 font-medium">Course</th>
                                            <th className="pb-2 font-medium">Year</th>
                                            <th className="pb-2 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingStudents.data.map((student) => (
                                            <tr key={student.id} className="border-b last:border-0">
                                                <td className="py-3">
                                                    {student.firstname} {student.lastname}
                                                </td>
                                                <td className="py-3">{student.student_id ?? '—'}</td>
                                                <td className="py-3">{student.course ?? '—'}</td>
                                                <td className="py-3">{student.year ?? '—'}</td>
                                                <td className="py-3 text-right">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        <Button size="sm" onClick={() => approveStudent(student.id)}>
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => rejectStudent(student.id)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={pendingStudents.links} />
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'employees' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Employees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-2 font-medium">Name</th>
                                            <th className="pb-2 font-medium">Employee ID</th>
                                            <th className="pb-2 font-medium">Department</th>
                                            <th className="pb-2 font-medium">Position</th>
                                            <th className="pb-2 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingEmployees.data.map((employee) => (
                                            <tr key={employee.id} className="border-b last:border-0">
                                                <td className="py-3">
                                                    {employee.firstname} {employee.lastname}
                                                </td>
                                                <td className="py-3">{employee.employee_id ?? '—'}</td>
                                                <td className="py-3">{employee.department ?? '—'}</td>
                                                <td className="py-3">{employee.position ?? '—'}</td>
                                                <td className="py-3 text-right">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        <Button size="sm" onClick={() => approveEmployee(employee.id)}>
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => rejectEmployee(employee.id)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={pendingEmployees.links} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </AttendanceLayout>
    );
}
