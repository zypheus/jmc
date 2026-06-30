import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import EmptyState from '@/components/library/EmptyState';
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

interface LibraryStudent {
    id: number;
    id_number: string | null;
    firstname: string | null;
    lastname: string | null;
    course: string | null;
    year: string | null;
}

interface LibraryEmployee {
    id: number;
    employee_id: string | null;
    firstname: string | null;
    lastname: string | null;
    department: string | null;
    position: string | null;
}

interface LibraryAttendanceLog {
    id: number;
    status: string;
    section: string | null;
    scanned_at: string;
    student: LibraryStudent | null;
    employee: LibraryEmployee | null;
}

interface LogsProps extends PageProps {
    logs: Paginated<LibraryAttendanceLog>;
    filters: {
        from?: string;
        to?: string;
        status?: string;
        search?: string;
        patron_type?: string;
    };
}

function patronName(log: LibraryAttendanceLog): string {
    if (log.student) {
        return [log.student.firstname, log.student.lastname].filter(Boolean).join(' ') || 'Student';
    }

    if (log.employee) {
        return [log.employee.firstname, log.employee.lastname].filter(Boolean).join(' ') || 'Employee';
    }

    return '-';
}

function patronDetails(log: LibraryAttendanceLog): string {
    if (log.student) {
        return [log.student.id_number, log.student.course, log.student.year].filter(Boolean).join(' | ') || 'Student';
    }

    if (log.employee) {
        return [log.employee.employee_id, log.employee.department, log.employee.position].filter(Boolean).join(' | ') || 'Employee';
    }

    return '-';
}

function patronType(log: LibraryAttendanceLog): string {
    if (log.student) {
        return 'Student';
    }

    if (log.employee) {
        return 'Faculty/Staff';
    }

    return '-';
}

function formatDateTime(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-PH');
}

function statusTone(status: string): 'in' | 'out' {
    return status.toUpperCase() === 'OUT' ? 'out' : 'in';
}

function buildExportUrl(base: string, filters: LogsProps['filters']): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });

    const query = params.toString();

    return query ? `${base}?${query}` : base;
}

export default function Logs({ logs, filters }: LogsProps) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [search, setSearch] = useState(filters.search ?? '');
    const [patronType, setPatronType] = useState(filters.patron_type ?? '');

    function applyFilters(event: FormEvent) {
        event.preventDefault();

        router.get(
            '/library/attendance/logs',
            {
                from: from || undefined,
                to: to || undefined,
                status: status || undefined,
                search: search || undefined,
                patron_type: patronType || undefined,
            },
            { preserveState: true },
        );
    }

    function clearFilters() {
        setFrom('');
        setTo('');
        setStatus('');
        setSearch('');
        setPatronType('');
        router.get('/library/attendance/logs', {}, { preserveState: true });
    }

    const activeFilters = {
        from: from || undefined,
        to: to || undefined,
        status: status || undefined,
        search: search || undefined,
        patron_type: patronType || undefined,
    };

    return (
        <LibraryLayout>
            <Head title="Library Attendance Logs" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Reports"
                    title="Library attendance logs"
                    description="IN and OUT scan history from the Library Admin attendance scanner."
                    actions={
                        <>
                            <a href={buildExportUrl('/library/attendance/logs/export/pdf', activeFilters)}>
                                <Button variant="outline" size="sm">Export PDF</Button>
                            </a>
                            <a href={buildExportUrl('/library/attendance/logs/export/excel', activeFilters)}>
                                <Button variant="outline" size="sm">Export Excel</Button>
                            </a>
                            <Link href="/library/attendance/logs/reports">
                                <Button variant="outline" size="sm">Reports</Button>
                            </Link>
                        </>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-2">
                                <Label htmlFor="from">From</Label>
                                <Input id="from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="to">To</Label>
                                <Input id="to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={status}
                                    onChange={(event) => setStatus(event.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="IN">IN</option>
                                    <option value="OUT">OUT</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="patron_type">Patron Type</Label>
                                <select
                                    id="patron_type"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={patronType}
                                    onChange={(event) => setPatronType(event.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="student">Students</option>
                                    <option value="employee">Faculty/Staff</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <Input id="search" value={search} onChange={(event) => setSearch(event.target.value)} />
                            </div>
                            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-5">
                                <Button type="submit">Apply Filters</Button>
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{logs.total} attendance log{logs.total === 1 ? '' : 's'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {logs.data.length === 0 ? (
                            <EmptyState
                                title="No attendance logs"
                                description="Library scanner activity will appear here once patrons scan IN or OUT."
                            />
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Patron</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Details</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Section</TableHead>
                                                <TableHead>Scanned At</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.data.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell>{patronName(log)}</TableCell>
                                                    <TableCell>{patronType(log)}</TableCell>
                                                    <TableCell className="text-muted-foreground">{patronDetails(log)}</TableCell>
                                                    <TableCell>
                                                        <StatusBadge tone={statusTone(log.status)}>{log.status}</StatusBadge>
                                                    </TableCell>
                                                    <TableCell>{log.section ?? '-'}</TableCell>
                                                    <TableCell>{formatDateTime(log.scanned_at)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <PaginationLinks links={logs.links} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
