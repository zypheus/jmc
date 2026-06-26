import { Head, Link } from '@inertiajs/react';
import { Activity, Clock3, ShieldCheck, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { AttendanceDashboardStats, PageProps } from '@/types';

const modules = [
    { title: 'Gate kiosk', description: 'Public IN/OUT scanner.', href: '/attendance', label: 'Open kiosk', external: true },
    { title: 'Pending approvals', description: 'Student and employee registrations.', href: '/attendance/pending', label: 'Pending queue' },
    { title: 'Patrons', description: 'Approved attendance patrons.', href: '/attendance/students', label: 'Students' },
    { title: 'Attendance logs', description: 'Filter and export scan history.', href: '/attendance/logs', label: 'Logs' },
    { title: 'Reports', description: 'Analytics and CSV export.', href: '/attendance/logs/reports', label: 'Reports hub' },
    { title: 'Kiosk settings', description: 'Sections, feedback, video.', href: '/attendance/section-picker', label: 'Settings' },
    { title: 'SMS', description: 'Blast and scan notifications.', href: '/attendance/sms-blast', label: 'SMS tools' },
];

interface AttendanceAdminPageProps extends PageProps {
    stats: AttendanceDashboardStats;
}

const metricCards = [
    {
        key: 'studentsCount',
        label: 'Students',
        icon: Users,
        tone: 'text-[#2e7d32]',
    },
    {
        key: 'employeesCount',
        label: 'Employees',
        icon: Users,
        tone: 'text-[#1f4ea7]',
    },
    {
        key: 'todayInCount',
        label: 'Today IN',
        icon: Activity,
        tone: 'text-[#2e7d32]',
    },
    {
        key: 'logsThisWeekCount',
        label: 'Logs This Week',
        icon: Clock3,
        tone: 'text-[#1f4ea7]',
    },
] as const;

export default function AttendanceAdmin({ stats }: AttendanceAdminPageProps) {
    return (
        <AttendanceLayout>
            <Head title="Attendance Admin Dashboard" />

            <div className="space-y-6">
                <Card className="relative overflow-hidden border-[#2e7d32]/40 bg-gradient-to-r from-[#2e7d32]/10 via-background to-background">
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-[#ffd700]" />
                    <CardHeader className="space-y-3">
                        <Badge className="w-fit bg-[#2e7d32] text-white hover:bg-[#2e7d32]">Attendance Command Center</Badge>
                        <div>
                            <CardTitle className="text-2xl">Attendance Admin Dashboard</CardTitle>
                            <CardDescription>JOSE MARIA COLLEGE Foundation Inc. - attendance administration</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                            <ShieldCheck className="mr-1 size-3.5" />
                            Pending registrations: {stats.pendingRegistrationsCount}
                        </Badge>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => {
                        const Icon = metric.icon;

                        return (
                            <Card key={metric.key}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                                    <Icon className={`size-4 ${metric.tone}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-semibold tracking-tight">{stats[metric.key]}</div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Staff Management</CardTitle>
                        <CardDescription>Create and manage attendance staff accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/staff-users">
                            <Button>Manage Attendance Staff</Button>
                        </Link>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {modules.map((item) => (
                        <Card key={item.href}>
                            <CardHeader>
                                <CardTitle className="text-base">{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href={item.href} target={item.external ? '_blank' : undefined}>
                                    <Button variant="outline" size="sm">{item.label}</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AttendanceLayout>
    );
}
