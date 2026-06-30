import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps, Paginated } from '@/types';

interface AttendanceStudent {
    id: number;
    firstname: string;
    lastname: string;
    course: string | null;
    year: string | null;
}

interface AttendanceEmployee {
    id: number;
    firstname: string | null;
    lastname: string | null;
    department: string | null;
}

interface AttendanceLog {
    id: number;
    status: string;
    section: string | null;
    scanned_at: string;
    student_id: number | null;
    employee_id: number | null;
    student: AttendanceStudent | null;
    employee: AttendanceEmployee | null;
}

interface IndexProps extends PageProps {
    logs: Paginated<AttendanceLog>;
    courses: string[];
    sections: string[];
    filters: {
        from?: string;
        to?: string;
        section?: string;
        year_level?: string;
        course?: string;
        status?: string;
        search?: string;
        patron_type?: string;
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

function patronName(log: AttendanceLog): string {
    if (log.student) {
        return `${log.student.firstname} ${log.student.lastname}`;
    }
    if (log.employee) {
        return `${log.employee.firstname ?? ''} ${log.employee.lastname ?? ''}`.trim();
    }
    return '—';
}

function patronMeta(log: AttendanceLog): string {
    if (log.student) {
        return [log.student.course, log.student.year].filter(Boolean).join(' · ') || 'Student';
    }
    if (log.employee) {
        return log.employee.department ?? 'Employee';
    }
    return '—';
}

function buildExportUrl(base: string, filters: IndexProps['filters']): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });
    const query = params.toString();
    return query ? `${base}?${query}` : base;
}

export default function Index({ logs, courses, sections, filters }: IndexProps) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [section, setSection] = useState(filters.section ?? '');
    const [yearLevel, setYearLevel] = useState(filters.year_level ?? '');
    const [course, setCourse] = useState(filters.course ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [search, setSearch] = useState(filters.search ?? '');
    const [patronType, setPatronType] = useState(filters.patron_type ?? '');

    function applyFilters(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/attendance/logs',
            {
                from: from || undefined,
                to: to || undefined,
                section: section || undefined,
                year_level: yearLevel || undefined,
                course: course || undefined,
                status: status || undefined,
                search: search || undefined,
                patron_type: patronType || undefined,
            },
            { preserveState: true },
        );
    }

    const activeFilters = {
        from: from || undefined,
        to: to || undefined,
        section: section || undefined,
        year_level: yearLevel || undefined,
        course: course || undefined,
        status: status || undefined,
        search: search || undefined,
        patron_type: patronType || undefined,
    };

    return (
        <AttendanceLayout>
            <Head title="Attendance Logs" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Attendance Logs</h1>
                        <p className="text-muted-foreground">View and export scan history.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <a href={buildExportUrl('/attendance/logs/export/pdf', activeFilters)}>
                            <Button variant="outline">📄 Export PDF</Button>
                        </a>
                        <a href={buildExportUrl('/attendance/logs/export/excel', activeFilters)}>
                            <Button variant="outline">📊 Export Excel</Button>
                        </a>
                        <Link href="/attendance/logs/reports">
                            <Button variant="outline">📈 Reports</Button>
                        </Link>
                        <Link href="/dashboard/attendance-admin">
                            <Button variant="outline">← Go Back</Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="from">From</Label>
                                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="to">To</Label>
                                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="section">Section</Label>
                                <select
                                    id="section"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                >
                                    <option value="">All sections</option>
                                    {sections.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
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
                                    onChange={(e) => setPatronType(e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="student">Students</option>
                                    <option value="employee">Employees</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course">Course</Label>
                                <select
                                    id="course"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={course}
                                    onChange={(e) => setCourse(e.target.value)}
                                >
                                    <option value="">All courses</option>
                                    {courses.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year_level">Year Level</Label>
                                <Input
                                    id="year_level"
                                    value={yearLevel}
                                    onChange={(e) => setYearLevel(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-4">
                                <Button type="submit">Apply Filters</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{logs.total} log{logs.total === 1 ? '' : 's'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-2 font-medium">Patron</th>
                                        <th className="pb-2 font-medium">Details</th>
                                        <th className="pb-2 font-medium">Status</th>
                                        <th className="pb-2 font-medium">Section</th>
                                        <th className="pb-2 font-medium">Scanned At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="border-b last:border-0">
                                            <td className="py-3">{patronName(log)}</td>
                                            <td className="py-3 text-muted-foreground">{patronMeta(log)}</td>
                                            <td className="py-3">
                                                <span
                                                    className={`rounded px-2 py-0.5 text-xs font-semibold ${
                                                        log.status.toUpperCase() === 'OUT'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}
                                                >
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="py-3">{log.section ?? '—'}</td>
                                            <td className="py-3">{log.scanned_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={logs.links} />
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
