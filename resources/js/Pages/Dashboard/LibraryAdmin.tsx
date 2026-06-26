import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeftRight,
    BookOpen,
    Clock3,
    DoorOpen,
    Hourglass,
    PlusCircle,
    ShieldAlert,
    UserCog,
    Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { LibraryDashboardStats, PageProps } from '@/types';

interface LibraryAdminPageProps extends PageProps {
    stats: LibraryDashboardStats;
}

const metricCards = [
    {
        key: 'studentsCount' as const,
        label: 'Students',
        description: 'Patron directory & ID cards',
        href: '/students',
        icon: Users,
        tone: 'text-[#23408E]',
    },
    {
        key: 'employeesCount' as const,
        label: 'Employees',
        description: 'Staff & faculty patrons',
        href: '/employees',
        icon: Users,
        tone: 'text-[#2E7D32]',
    },
    {
        key: 'booksCount' as const,
        label: 'Book copies',
        description: 'Catalog & collections',
        href: '/books?show_all=1',
        icon: BookOpen,
        tone: 'text-[#23408E]',
    },
    {
        key: 'activeLoansCount' as const,
        label: 'Active loans',
        description: 'Checkout & renewals',
        href: '/logs',
        icon: Clock3,
        tone: 'text-[#2E7D32]',
    },
];

const quickActions = [
    { label: 'Open catalog', href: '/books', icon: BookOpen, variant: 'default' as const },
    { label: 'Circulation desk', href: '/logs', icon: ArrowLeftRight, variant: 'secondary' as const },
    { label: 'Room requests', href: '/rooms/pending', icon: DoorOpen, variant: 'outline' as const },
    { label: 'Holdings report', href: '/reports/library-holdings', icon: BookOpen, variant: 'outline' as const },
];

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

export default function LibraryAdmin({ stats, auth }: LibraryAdminPageProps) {
    const firstName = auth.user?.fname;

    return (
        <LibraryLayout>
            <Head title="Library Admin Dashboard" />

            <div className="dashboard-home space-y-6">
                <Card className="dashboard-hero overflow-hidden border-[#E5E7EB] shadow-sm">
                    <div className="h-1.5 bg-[#ffd700]" />
                    <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#23408E]">
                                Library command center
                            </p>
                            <h1 className="text-2xl font-semibold">
                                Welcome back{firstName ? `, ${firstName}` : ''}
                            </h1>
                            <p className="max-w-xl text-sm text-muted-foreground">
                                JOSE MARIA COLLEGE Foundation Inc. — manage catalog, circulation, patrons,
                                and library operations from one place.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
                            <Link
                                href="/pending"
                                className="inline-flex items-center gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 transition-transform hover:-translate-y-0.5"
                            >
                                <Hourglass className="size-4" />
                                Pending: {stats.pendingCount}
                            </Link>
                            <Link
                                href="/admin/fines/outstanding"
                                className="inline-flex items-center gap-2 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-900 transition-transform hover:-translate-y-0.5"
                            >
                                <ShieldAlert className="size-4" />
                                Fines: {stats.outstandingFinesCount}
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => {
                        const Icon = metric.icon;

                        return (
                            <Link key={metric.key} href={metric.href} className="group block no-underline">
                                <Card className="dashboard-stat-card h-full border-[#E5E7EB] shadow-sm">
                                    <CardContent className="space-y-3 p-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {metric.label}
                                            </span>
                                            <span
                                                className={`flex size-10 items-center justify-center rounded-xl bg-[#F8FAFC] ${metric.tone}`}
                                            >
                                                <Icon className="size-5" />
                                            </span>
                                        </div>
                                        <p className="text-3xl font-semibold tracking-tight text-foreground group-hover:text-[#23408E]">
                                            {stats[metric.key]}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="rounded-2xl border-[#E5E7EB] shadow-sm lg:col-span-1">
                        <CardHeader className="border-b border-[#E5E7EB] pb-3">
                            <CardTitle className="text-base font-semibold">Staff management</CardTitle>
                            <CardDescription>Create and manage library staff accounts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            <Button asChild className="w-full rounded-[10px]">
                                <Link href="/staff-users">
                                    <UserCog className="mr-2 size-4" />
                                    Manage library staff
                                </Link>
                            </Button>
                            <Button asChild variant="secondary" className="w-full rounded-[10px]">
                                <Link href="/books">
                                    <PlusCircle className="mr-2 size-4" />
                                    Add catalog record
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-[#E5E7EB] shadow-sm lg:col-span-2">
                        <CardHeader className="border-b border-[#E5E7EB] pb-3">
                            <CardTitle className="text-base font-semibold">Quick actions</CardTitle>
                            <CardDescription>Common library workflows</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
                            {quickActions.map((action) => {
                                const Icon = action.icon;

                                return (
                                    <Button
                                        key={action.href}
                                        asChild
                                        variant={action.variant}
                                        className="h-auto justify-start rounded-[10px] px-4 py-3"
                                    >
                                        <Link href={action.href}>
                                            <Icon className="mr-2 size-4" />
                                            {action.label}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="mb-4 text-base font-semibold">All modules</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {modules.map((item) => (
                            <Card key={item.href} className="dashboard-module-card border-[#E5E7EB] shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base">{item.title}</CardTitle>
                                    <CardDescription>{item.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {item.external ? (
                                        <a href={item.href} target="_blank" rel="noreferrer">
                                            <Button variant="outline" size="sm" className="rounded-[10px]">
                                                {item.label}
                                            </Button>
                                        </a>
                                    ) : (
                                        <Link href={item.href}>
                                            <Button variant="outline" size="sm" className="rounded-[10px]">
                                                {item.label}
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </LibraryLayout>
    );
}
