import { Head } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttendanceLayout from '@/Layouts/AttendanceLayout';

const modules = [
    { title: 'Gate kiosk', description: 'Public scanner terminal.', href: '/attendance', label: 'Kiosk', external: true },
    { title: 'Pending approvals', description: 'Review new registrations.', href: '/attendance/pending', label: 'Pending' },
    { title: 'Logs', description: 'Attendance history.', href: '/attendance/logs', label: 'View logs' },
    { title: 'Reports', description: 'Dashboard and exports.', href: '/attendance/logs/reports', label: 'Reports' },
    { title: 'Feedback', description: 'Logout satisfaction responses.', href: '/attendance/feedbacks', label: 'Feedback' },
];

export default function AttendanceStaff() {
    return (
        <AttendanceLayout>
            <Head title="Attendance Staff Dashboard" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Attendance Staff Dashboard</h1>
                    <p className="text-muted-foreground">Daily attendance operations (no patron admin).</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {modules.map((item) => (
                        <Card key={item.href}>
                            <CardHeader>
                                <CardTitle className="text-base">{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <a href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined}>
                                    <Button variant="outline" size="sm">{item.label}</Button>
                                </a>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AttendanceLayout>
    );
}
