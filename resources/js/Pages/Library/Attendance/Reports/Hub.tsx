import { Head, Link } from '@inertiajs/react';

import PageHeader from '@/components/library/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryLayout from '@/Layouts/LibraryLayout';

export default function Hub() {
    return (
        <LibraryLayout>
            <Head title="Library Attendance Reports" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Reports"
                    title="Library attendance reports"
                    description="Analytics and export tools for Library Admin attendance scanner data."
                    backHref="/library/attendance/logs"
                    backLabel="Back to attendance logs"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dashboard</CardTitle>
                            <CardDescription>Top patrons, program totals, trends, and busiest hours.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/library/attendance/logs/reports/dashboard">
                                <Button>Open Dashboard</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>CSV Export</CardTitle>
                            <CardDescription>Download the library attendance report data from the dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/library/attendance/logs/reports/dashboard">
                                <Button variant="outline">Go to Dashboard</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </LibraryLayout>
    );
}
