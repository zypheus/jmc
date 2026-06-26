import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttendanceLayout from '@/Layouts/AttendanceLayout';

export default function Hub() {
    return (
        <AttendanceLayout>
            <Head title="Attendance Reports" />

            <div className="space-y-6">
                <div>
                    <Link href="/attendance/logs" className="text-sm text-primary hover:underline">
                        &larr; Back to logs
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Attendance Reports</h1>
                    <p className="text-muted-foreground">Analytics and export tools for attendance data.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dashboard</CardTitle>
                            <CardDescription>
                                Top patrons, program totals, trends, and busiest hours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/attendance/logs/reports/dashboard">
                                <Button>Open Dashboard</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>CSV Export</CardTitle>
                            <CardDescription>
                                Download patron attendance report as CSV from the dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/attendance/logs/reports/dashboard">
                                <Button variant="outline">Go to Dashboard</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AttendanceLayout>
    );
}
