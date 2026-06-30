import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import PageHeader from '@/components/library/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface RankedStudent {
    id: number;
    firstname: string;
    lastname: string;
    course: string | null;
    ins_count?: number;
    distinct_in_days?: number;
}

interface ProgramTotal {
    course: string;
    student_count: number;
    ins_count: number;
    avg_ins_per_student: number;
}

interface TrendPoint {
    label: string;
    count: number;
}

interface HourPoint {
    hour: number;
    label: string;
    count: number;
}

interface DashboardProps extends PageProps {
    from: string | null;
    to: string | null;
    topStudentsByIns: RankedStudent[];
    topStudentsByDistinctInDays: RankedStudent[];
    programAttendanceTotals: ProgramTotal[];
    weeklyInsTrend: TrendPoint[];
    monthlyInsTrend: TrendPoint[];
    busiestHours: HourPoint[];
}

function buildExportUrl(from: string, to: string): string {
    const params = new URLSearchParams();

    if (from) {
        params.set('from', from);
    }

    if (to) {
        params.set('to', to);
    }

    const query = params.toString();

    return query ? `/library/attendance/logs/reports/export?${query}` : '/library/attendance/logs/reports/export';
}

function emptyMarker(value: string | null | undefined): string {
    return value || '-';
}

export default function Dashboard({
    from,
    to,
    topStudentsByIns,
    topStudentsByDistinctInDays,
    programAttendanceTotals,
    weeklyInsTrend,
    monthlyInsTrend,
    busiestHours,
}: DashboardProps) {
    const [fromDate, setFromDate] = useState(from ?? '');
    const [toDate, setToDate] = useState(to ?? '');

    function applyRange(event: FormEvent) {
        event.preventDefault();

        router.get(
            '/library/attendance/logs/reports/dashboard',
            {
                from: fromDate || undefined,
                to: toDate || undefined,
            },
            { preserveState: true },
        );
    }

    return (
        <LibraryLayout>
            <Head title="Library Attendance Reports Dashboard" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Reports"
                    title="Library attendance reports dashboard"
                    description="Library scanner attendance summaries from library-specific attendance logs."
                    backHref="/library/attendance/logs/reports"
                    backLabel="Reports hub"
                    actions={
                        <a href={buildExportUrl(fromDate, toDate)}>
                            <Button variant="outline" size="sm">Export CSV</Button>
                        </a>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Date Range</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyRange} className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="from">From</Label>
                                <Input id="from" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="to">To</Label>
                                <Input id="to" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
                            </div>
                            <Button type="submit">Apply</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Students by IN Scans</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead className="text-right">IN Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topStudentsByIns.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.firstname} {row.lastname}</TableCell>
                                            <TableCell>{emptyMarker(row.course)}</TableCell>
                                            <TableCell className="text-right">{row.ins_count ?? 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Students by Distinct IN Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead className="text-right">Days</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topStudentsByDistinctInDays.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.firstname} {row.lastname}</TableCell>
                                            <TableCell>{emptyMarker(row.course)}</TableCell>
                                            <TableCell className="text-right">{row.distinct_in_days ?? 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Program Attendance Totals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead className="text-right">Students</TableHead>
                                        <TableHead className="text-right">IN Count</TableHead>
                                        <TableHead className="text-right">Avg IN / Student</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {programAttendanceTotals.map((row) => (
                                        <TableRow key={row.course}>
                                            <TableCell>{row.course}</TableCell>
                                            <TableCell className="text-right">{row.student_count}</TableCell>
                                            <TableCell className="text-right">{row.ins_count}</TableCell>
                                            <TableCell className="text-right">{row.avg_ins_per_student}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-3">
                    <TrendCard title="Weekly IN Trend" data={weeklyInsTrend} />
                    <TrendCard title="Monthly IN Trend" data={monthlyInsTrend} />
                    <TrendCard title="Busiest Hours" data={busiestHours} />
                </div>
            </div>
        </LibraryLayout>
    );
}

function TrendCard({ title, data }: { title: string; data: TrendPoint[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {data.map((point) => (
                    <div key={point.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{point.label}</span>
                        <span className="font-medium">{point.count}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
