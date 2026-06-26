import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps, Paginated } from '@/types';

interface AttendanceEmployee {
    id: number;
    employee_id: string | null;
    firstname: string | null;
    lastname: string | null;
    department: string | null;
    position: string | null;
    qrcode: string | null;
}

interface IndexProps extends PageProps {
    employees: Paginated<AttendanceEmployee>;
    departments: string[];
    positions: string[];
    filters: {
        search?: string;
        department?: string;
        position?: string;
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

export default function Index({ employees, departments, positions, filters }: IndexProps) {
    const { flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [department, setDepartment] = useState(filters.department ?? '');
    const [position, setPosition] = useState(filters.position ?? '');

    function applyFilters(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/attendance/employees',
            {
                search: search || undefined,
                department: department || undefined,
                position: position || undefined,
            },
            { preserveState: true },
        );
    }

    function destroyEmployee(id: number) {
        if (confirm('Delete this employee?')) {
            router.delete(`/attendance/employees/${id}`);
        }
    }

    return (
        <AttendanceLayout>
            <Head title="Attendance Employees" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Employees</h1>
                        <p className="text-muted-foreground">Manage attendance employee records.</p>
                    </div>
                    <Link href="/attendance/employees/create">
                        <Button>Add Employee</Button>
                    </Link>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <select
                                    id="department"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                >
                                    <option value="">All departments</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="position">Position</Label>
                                <select
                                    id="position"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                >
                                    <option value="">All positions</option>
                                    {positions.map((pos) => (
                                        <option key={pos} value={pos}>
                                            {pos}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Button type="submit">Apply Filters</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{employees.total} employee{employees.total === 1 ? '' : 's'}</CardTitle>
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
                                        <th className="pb-2 font-medium">QR Code</th>
                                        <th className="pb-2 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.data.map((employee) => (
                                        <tr key={employee.id} className="border-b last:border-0">
                                            <td className="py-3">
                                                {employee.firstname} {employee.lastname}
                                            </td>
                                            <td className="py-3">{employee.employee_id ?? '—'}</td>
                                            <td className="py-3">{employee.department ?? '—'}</td>
                                            <td className="py-3">{employee.position ?? '—'}</td>
                                            <td className="py-3 font-mono text-xs">{employee.qrcode ?? '—'}</td>
                                            <td className="py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/attendance/employees/${employee.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => destroyEmployee(employee.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={employees.links} />
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
