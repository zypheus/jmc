import { Head, Link } from '@inertiajs/react';
import { BookOpen, Clock3, ShieldAlert, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { LibraryDashboardStats, PageProps } from '@/types';

const modules = [
    { title: 'Catalog', description: 'Search and manage book copies.', href: '/books', label: 'Open catalog' },
    { title: 'Circulation', description: 'Checkout, return, renewals.', href: '/logs', label: 'Circulation desk' },
    { title: 'Patrons', description: 'Students and employees.', href: '/students', label: 'Patron directory' },
    { title: 'Pending approvals', description: 'Review registration requests.', href: '/pending', label: 'Pending queue' },
    { title: 'OPAC', description: 'Public online catalog.', href: '/opac', label: 'View OPAC', external: true },
    { title: 'Fines & policy', description: 'Circulation rules and clearance.', href: '/admin/circulation-policy', label: 'Policy settings' },
    { title: 'Outstanding fines', description: 'Clear overdue fines.', href: '/admin/fines/outstanding', label: 'Fines queue' },
    { title: 'Repository', description: 'Shared library documents.', href: '/files', label: 'File repository' },
    { title: 'Reports', description: 'Holdings and activity exports.', href: '/reports/library-holdings', label: 'Reports' },
];

interface LibraryAdminPageProps extends PageProps {
    stats: LibraryDashboardStats;
}

const metricCards = [
    {
        key: 'studentsCount',
        label: 'Students',
        icon: Users,
        tone: 'text-[#1f4ea7]',
    },
    {
        key: 'employeesCount',
        label: 'Employees',
        icon: Users,
        tone: 'text-[#2e7d32]',
    },
    {
        key: 'booksCount',
        label: 'Book Copies',
        icon: BookOpen,
        tone: 'text-[#1f4ea7]',
    },
    {
        key: 'activeLoansCount',
        label: 'Active Loans',
        icon: Clock3,
        tone: 'text-[#2e7d32]',
    },
] as const;

export default function LibraryAdmin({ stats }: LibraryAdminPageProps) {
    return (
        <LibraryLayout>
            <Head title="Library Admin Dashboard" />

            <div className="space-y-6">
                <Card className="relative overflow-hidden border-[#1f4ea7]/30 bg-gradient-to-r from-[#1f4ea7]/10 via-background to-background">
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-[#ffd700]" />
                    <CardHeader className="space-y-3">
                        <Badge className="w-fit bg-[#1f4ea7] text-white hover:bg-[#1f4ea7]">Library Command Center</Badge>
                        <div>
                            <CardTitle className="text-2xl">Library Admin Dashboard</CardTitle>
                            <CardDescription>JOSE MARIA COLLEGE Foundation Inc. - library administration</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Pending approvals: {stats.pendingCount}</Badge>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-900">
                            <ShieldAlert className="mr-1 size-3.5" />
                            Outstanding fines: {stats.outstandingFinesCount}
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
                        <CardDescription>Create and manage library staff login accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/staff-users">
                            <Button>Manage Library Staff</Button>
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
                                {item.external ? (
                                    <a href={item.href} target="_blank" rel="noreferrer">
                                        <Button variant="outline" size="sm">{item.label}</Button>
                                    </a>
                                ) : (
                                    <Link href={item.href}>
                                        <Button variant="outline" size="sm">{item.label}</Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </LibraryLayout>
    );
}
