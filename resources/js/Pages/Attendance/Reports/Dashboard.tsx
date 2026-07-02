import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
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
    only: string | null;
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
    return query ? `/attendance/logs/reports/export?${query}` : '/attendance/logs/reports/export';
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
            '/attendance/logs/reports/dashboard',
            {
                from: fromDate || undefined,
                to: toDate || undefined,
            },
            { preserveState: true },
        );
    }

    return (
        <AttendanceLayout>
            <Head title="Attendance Reports Dashboard" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link href="/attendance/logs/reports" className="text-sm text-primary hover:underline">
                            &larr; Reports hub
                        </Link>
                        <h1 className="mt-2 text-2xl font-semibold">Reports Dashboard</h1>
                    </div>
                    <a href={buildExportUrl(fromDate, toDate)}>
                        <Button variant="outline">Export CSV</Button>
                    </a>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Date Range</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyRange} className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="from">From</Label>
                                <Input
                                    id="from"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="to">To</Label>
                                <Input
                                    id="to"
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
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
                            <div className="overflow-x-auto">
                            <table className="min-w-[32rem] w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-2 font-medium">Name</th>
                                        <th className="pb-2 font-medium">Course</th>
                                        <th className="pb-2 font-medium text-right">IN Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topStudentsByIns.map((row) => (
                                        <tr key={row.id} className="border-b last:border-0">
                                            <td className="py-2">
                                                {row.firstname} {row.lastname}
                                            </td>
                                            <td className="py-2">{row.course ?? '—'}</td>
                                            <td className="py-2 text-right">{row.ins_count ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Students by Distinct IN Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                            <table className="min-w-[32rem] w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-2 font-medium">Name</th>
                                        <th className="pb-2 font-medium">Course</th>
                                        <th className="pb-2 font-medium text-right">Days</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topStudentsByDistinctInDays.map((row) => (
                                        <tr key={row.id} className="border-b last:border-0">
                                            <td className="py-2">
                                                {row.firstname} {row.lastname}
                                            </td>
                                            <td className="py-2">{row.course ?? '—'}</td>
                                            <td className="py-2 text-right">{row.distinct_in_days ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Program Attendance Totals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-2 font-medium">Course</th>
                                        <th className="pb-2 font-medium text-right">Students</th>
                                        <th className="pb-2 font-medium text-right">IN Count</th>
                                        <th className="pb-2 font-medium text-right">Avg IN / Student</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {programAttendanceTotals.map((row) => (
                                        <tr key={row.course} className="border-b last:border-0">
                                            <td className="py-2">{row.course}</td>
                                            <td className="py-2 text-right">{row.student_count}</td>
                                            <td className="py-2 text-right">{row.ins_count}</td>
                                            <td className="py-2 text-right">{row.avg_ins_per_student}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly IN Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {weeklyInsTrend.map((point) => (
                                <div key={point.label} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{point.label}</span>
                                    <span className="font-medium">{point.count}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly IN Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {monthlyInsTrend.map((point) => (
                                <div key={point.label} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{point.label}</span>
                                    <span className="font-medium">{point.count}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Busiest Hours</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {busiestHours.map((point) => (
                                <div key={point.hour} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{point.label}</span>
                                    <span className="font-medium">{point.count}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AttendanceLayout>
    );
}
