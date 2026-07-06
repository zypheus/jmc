import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    History,
    Library,
    ShieldCheck,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import type {
    PageProps,
    SuperAdminDashboardStats,
    SuperAdminRoleBreakdown,
    SuperAdminStaffActivity,
} from '@/types';

interface SuperAdminPageProps extends PageProps {
    stats: SuperAdminDashboardStats;
    roleBreakdown: SuperAdminRoleBreakdown;
    recentStaffActivity: SuperAdminStaffActivity[];
}

const metricCards = [
    {
        key: 'totalStaffCount',
        label: 'Total staff',
        detail: 'Accounts with system roles',
        href: '/staff-users',
        icon: Users,
        tone: 'bg-blue-50 text-blue-800',
    },
    {
        key: 'activeStaffCount',
        label: 'Active staff',
        detail: 'Can access assigned modules',
        href: '/staff-users',
        icon: CheckCircle2,
        tone: 'bg-emerald-50 text-emerald-800',
    },
    {
        key: 'inactiveStaffCount',
        label: 'Inactive staff',
        detail: 'Disabled accounts',
        href: '/staff-users',
        icon: XCircle,
        tone: 'bg-rose-50 text-rose-800',
    },
    {
        key: 'superAdminCount',
        label: 'Super admins',
        detail: 'Full system access',
        href: '/staff-users',
        icon: ShieldCheck,
        tone: 'bg-amber-50 text-amber-800',
    },
] as const;

const moduleCards = [
    {
        title: 'Library workspace',
        description: 'Open catalog, circulation, patrons, and library administration tools.',
        href: '/dashboard/library-admin',
        label: 'Open Library',
        icon: Library,
        countKey: 'libraryStaffCount',
        tone: 'bg-emerald-50 text-emerald-800',
    },
    {
        title: 'Attendance workspace',
        description: 'Open scan logs, registrations, reporting, and attendance administration tools.',
        href: '/dashboard/attendance-admin',
        label: 'Open Attendance',
        icon: ClipboardCheck,
        countKey: 'attendanceStaffCount',
        tone: 'bg-indigo-50 text-indigo-800',
    },
] as const;

const roleRows: Array<{ key: keyof SuperAdminRoleBreakdown; label: string }> = [
    { key: 'super_admin', label: 'Super administrators' },
    { key: 'library_admin', label: 'Library administrators' },
    { key: 'library_staff', label: 'Library staff' },
    { key: 'attendance_admin', label: 'Attendance administrators' },
    { key: 'attendance_staff', label: 'Attendance staff' },
];

export default function SuperAdmin({ stats, roleBreakdown, recentStaffActivity, auth }: SuperAdminPageProps) {
    const firstName = auth.user?.fname;
    const activePercent = stats.totalStaffCount > 0
        ? Math.round((stats.activeStaffCount / stats.totalStaffCount) * 100)
        : 0;

    return (
        <AdminLayout>
            <Head title="Super Admin Dashboard" />

            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <section className="relative overflow-hidden rounded-xl bg-[#12295a] text-white" aria-labelledby="super-admin-dashboard-title">
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#facc15]" aria-hidden="true" />
                    <div className="absolute right-0 top-0 hidden h-full w-1/3 bg-[linear-gradient(135deg,rgba(250,204,21,0.2),rgba(255,255,255,0))] lg:block" aria-hidden="true" />
                    <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-3xl">
                            <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">Super Administrator</Badge>
                            <h1 id="super-admin-dashboard-title" className="mt-4 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                                Welcome back{firstName ? `, ${firstName}` : ''}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50/88 sm:text-base">
                                Control staff access across Library and Attendance from one dashboard.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                            <Link href="/staff-users/create" className="rounded-lg bg-white px-4 py-3 text-[#12295a] outline-none transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#12295a]">
                                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]">
                                    <UserPlus className="size-4" aria-hidden="true" />
                                    Create account
                                </span>
                                <span className="mt-1 block text-sm text-slate-600">Add staff access</span>
                            </Link>
                            <Link href="/staff-users" className="rounded-lg bg-blue-950/45 px-4 py-3 text-white outline-none ring-1 ring-white/12 transition-colors hover:bg-blue-950/65 focus-visible:ring-2 focus-visible:ring-white">
                                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]">
                                    <Users className="size-4" aria-hidden="true" />
                                    Manage staff
                                </span>
                                <span className="mt-1 block text-sm text-blue-50/78">{stats.totalStaffCount} accounts</span>
                            </Link>
                        </div>
                    </div>
                </section>

                <section aria-label="Staff access overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => {
                        const Icon = metric.icon;

                        return (
                            <Link key={metric.key} href={metric.href} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#23408e] focus-visible:ring-offset-2">
                                <Card className="h-full rounded-xl border-slate-200 py-0 shadow-none transition-colors group-hover:border-slate-300 group-hover:bg-slate-50/70">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
                                            <span className={`flex size-9 items-center justify-center rounded-lg ${metric.tone}`}>
                                                <Icon className="size-4" aria-hidden="true" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-950">{stats[metric.key]}</p>
                                        <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-6">
                        <section aria-labelledby="super-admin-workspaces-title">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 id="super-admin-workspaces-title" className="text-lg font-semibold text-slate-950">Workspaces</h2>
                                    <p className="mt-1 text-sm text-slate-600">Move into a module without changing the super-admin sidebar.</p>
                                </div>
                                <Badge variant="secondary" className="rounded-full px-3 py-1">2 modules</Badge>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                {moduleCards.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <Link key={item.href} href={item.href} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#23408e] focus-visible:ring-offset-2">
                                            <Card className="h-full rounded-xl border-slate-200 py-0 shadow-none transition-colors group-hover:border-slate-300 group-hover:bg-slate-50/80">
                                                <CardContent className="flex min-h-56 flex-col p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <span className={`flex size-11 items-center justify-center rounded-lg ${item.tone}`}>
                                                            <Icon className="size-5" aria-hidden="true" />
                                                        </span>
                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                            {stats[item.countKey]} staff
                                                        </span>
                                                    </div>
                                                    <h3 className="mt-5 text-base font-semibold text-slate-950">{item.title}</h3>
                                                    <p className="mt-2 text-sm leading-5 text-slate-600">{item.description}</p>
                                                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-[#23408e]">
                                                        {item.label}
                                                        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                                    </span>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="rounded-xl bg-[#0f5238] px-6 py-6 text-white sm:px-7" aria-labelledby="super-admin-control-title">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-2xl">
                                    <h2 id="super-admin-control-title" className="text-lg font-semibold">Staff account control</h2>
                                    <p className="mt-1 text-sm leading-6 text-emerald-50/90">
                                        Create accounts, assign roles, activate access, and protect the last active super administrator.
                                    </p>
                                </div>
                                <Button asChild variant="secondary" className="min-h-11 shrink-0 justify-between bg-white px-5 text-[#0f5238] hover:bg-emerald-50 sm:min-w-64">
                                    <Link href="/staff-users">
                                        Review staff accounts
                                        <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-4">
                        <Card className="rounded-xl border-slate-200 py-0 shadow-none">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-950">Access health</h2>
                                        <p className="mt-1 text-sm text-slate-600">Active staff coverage</p>
                                    </div>
                                    <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                                        <Activity className="size-5" aria-hidden="true" />
                                    </span>
                                </div>
                                <div className="mt-5">
                                    <div className="flex items-end justify-between gap-3">
                                        <span className="text-4xl font-semibold tabular-nums tracking-tight text-slate-950">{activePercent}%</span>
                                        <span className="pb-1 text-xs text-slate-500">{stats.activeStaffCount} of {stats.totalStaffCount} active</span>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-[#23408e]" style={{ width: `${activePercent}%` }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-slate-200 py-0 shadow-none">
                            <CardContent className="p-5">
                                <h2 className="text-base font-semibold text-slate-950">Role coverage</h2>
                                <div className="mt-4 space-y-3">
                                    {roleRows.map((role) => (
                                        <div key={role.key} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                                            <span className="text-sm text-slate-600">{role.label}</span>
                                            <span className="text-sm font-semibold tabular-nums text-slate-950">{roleBreakdown[role.key]}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-slate-200 py-0 shadow-none">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-950">Recent staff activity</h2>
                                        <p className="mt-1 text-sm text-slate-600">Latest account changes</p>
                                    </div>
                                    <History className="size-5 text-slate-400" aria-hidden="true" />
                                </div>

                                <div className="mt-4 space-y-3">
                                    {recentStaffActivity.length > 0 ? recentStaffActivity.map((activity) => {
                                        const content = (
                                            <span className="block rounded-lg border border-slate-200 px-3 py-2 transition-colors hover:bg-slate-50">
                                                <span className="block text-sm font-medium text-slate-950">{activity.title}</span>
                                                {activity.body && <span className="mt-0.5 block text-xs text-slate-600">{activity.body}</span>}
                                                {activity.createdAt && <span className="mt-1 block text-[11px] text-slate-400">{activity.createdAt}</span>}
                                            </span>
                                        );

                                        return activity.actionUrl ? (
                                            <Link key={activity.id} href={activity.actionUrl} className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#23408e] focus-visible:ring-offset-2">
                                                {content}
                                            </Link>
                                        ) : (
                                            <div key={activity.id}>{content}</div>
                                        );
                                    }) : (
                                        <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center">
                                            <p className="text-sm font-medium text-slate-700">No staff activity yet</p>
                                            <p className="mt-1 text-xs text-slate-500">Account changes will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </section>
            </div>
        </AdminLayout>
    );
}
