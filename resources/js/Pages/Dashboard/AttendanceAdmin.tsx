import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    BookOpenCheck,
    CalendarDays,
    ChevronRight,
    Clock3,
    IdCard,
    MessageSquareText,
    Settings2,
    UserRoundCheck,
    Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { AttendanceDashboardStats, PageProps } from '@/types';

const modules = [
    {
        title: 'Gate kiosk',
        description: 'Public IN/OUT scanner for real-time terminal entry.',
        href: '/attendance',
        label: 'Open kiosk',
        icon: IdCard,
        tone: 'bg-indigo-50 text-indigo-700',
        external: true,
    },
    {
        title: 'Pending approvals',
        description: 'Review student and employee registration requests.',
        href: '/attendance/pending',
        label: 'Pending queue',
        icon: UserRoundCheck,
        tone: 'bg-rose-50 text-rose-700',
        external: false,
    },
    {
        title: 'Patrons',
        description: 'Directory of approved attendance patrons and staff.',
        href: '/attendance/students',
        label: 'Students',
        icon: Users,
        tone: 'bg-emerald-50 text-emerald-700',
        external: false,
    },
    {
        title: 'Attendance logs',
        description: 'Filter and export comprehensive scan history logs.',
        href: '/attendance/logs',
        label: 'Logs',
        icon: BookOpenCheck,
        tone: 'bg-blue-50 text-blue-700',
        external: false,
    },
    {
        title: 'Reports',
        description: 'Review attendance analytics and download CSV exports.',
        href: '/attendance/logs/reports',
        label: 'Reports hub',
        icon: BarChart3,
        tone: 'bg-amber-50 text-amber-700',
        external: false,
    },
    {
        title: 'Kiosk settings',
        description: 'Configure sections, feedback messages, and video.',
        href: '/attendance/section-picker',
        label: 'Settings',
        icon: Settings2,
        tone: 'bg-slate-100 text-slate-700',
        external: false,
    },
    {
        title: 'SMS',
        description: 'Send announcement blasts and scan notifications.',
        href: '/attendance/sms-blast',
        label: 'SMS tools',
        icon: MessageSquareText,
        tone: 'bg-violet-50 text-violet-700',
        external: false,
    },
] as const;

interface AttendanceAdminPageProps extends PageProps {
    stats: AttendanceDashboardStats;
}

const metricCards = [
    {
        key: 'studentsCount',
        label: 'Students',
        detail: 'Active students',
        href: '/attendance/students',
        icon: Users,
        tone: 'bg-emerald-50 text-emerald-700',
    },
    {
        key: 'employeesCount',
        label: 'Employees',
        detail: 'Verified accounts',
        href: '/attendance/employees',
        icon: CalendarDays,
        tone: 'bg-indigo-50 text-indigo-700',
    },
    {
        key: 'todayInCount',
        label: 'Today IN',
        detail: 'Waiting for scans',
        href: '/attendance/logs',
        icon: Activity,
        tone: 'bg-amber-50 text-amber-700',
    },
    {
        key: 'logsThisWeekCount',
        label: 'Logs this week',
        detail: 'Weekly activity',
        href: '/attendance/logs',
        icon: Clock3,
        tone: 'bg-rose-50 text-rose-700',
    },
] as const;

export default function AttendanceAdmin({ stats }: AttendanceAdminPageProps) {
    return (
        <AttendanceLayout>
            <Head title="Attendance Admin Dashboard" />

            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white" aria-labelledby="attendance-dashboard-title">
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#facc15]" aria-hidden="true" />
                    <div className="flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1.5">
                            <h1 id="attendance-dashboard-title" className="text-balance text-2xl font-semibold tracking-tight text-slate-950">
                                Attendance Admin Dashboard
                            </h1>
                            <p className="text-sm text-slate-600">JOSE MARIA COLLEGE Foundation Inc.</p>
                        </div>
                        <div className="flex flex-col items-start gap-2 lg:items-end">
                            <Link
                                href="/attendance/pending"
                                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 outline-none transition-colors hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-[#0f5238] focus-visible:ring-offset-2"
                            >
                                <span className="size-2 rounded-full bg-rose-600" aria-hidden="true" />
                                Pending registrations: {stats.pendingRegistrationsCount}
                            </Link>
                            <span className="text-xs text-slate-500">Live administrative overview</span>
                        </div>
                    </div>
                </section>

                <section aria-label="Attendance overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => {
                        const Icon = metric.icon;

                        return (
                            <Link key={metric.key} href={metric.href} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#0f5238] focus-visible:ring-offset-2">
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

                <section className="flex flex-col gap-5 rounded-xl bg-[#0f5238] px-6 py-6 text-white sm:px-7 lg:flex-row lg:items-center lg:justify-between" aria-labelledby="attendance-staff-title">
                    <div className="max-w-2xl">
                        <h2 id="attendance-staff-title" className="text-lg font-semibold">Staff management</h2>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-emerald-50/90">
                            Create and manage attendance staff accounts to delegate monitoring duties and terminal operations across campus.
                        </p>
                    </div>
                    <Button asChild variant="secondary" className="min-h-11 shrink-0 justify-between bg-white px-5 text-[#0f5238] hover:bg-emerald-50 sm:min-w-64">
                        <Link href="/staff-users">
                            Manage attendance staff
                            <ChevronRight className="ml-2 size-4" aria-hidden="true" />
                        </Link>
                    </Button>
                </section>

                <section aria-labelledby="attendance-tools-title">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 id="attendance-tools-title" className="text-lg font-semibold text-slate-950">Attendance tools</h2>
                            <p className="mt-1 text-sm text-slate-600">Open a workflow to continue daily operations.</p>
                        </div>
                        <Badge variant="secondary" className="rounded-full px-3 py-1">{modules.length} tools</Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {modules.map((item) => {
                            const Icon = item.icon;
                            const content = (
                                <Card className="h-full rounded-xl border-slate-200 py-0 shadow-none transition-colors group-hover:border-slate-300 group-hover:bg-slate-50/80">
                                    <CardContent className="flex h-full min-h-52 flex-col p-5">
                                        <span className={`flex size-10 items-center justify-center rounded-lg ${item.tone}`}>
                                            <Icon className="size-5" aria-hidden="true" />
                                        </span>
                                        <h3 className="mt-5 text-base font-semibold text-slate-950">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-5 text-slate-600">{item.description}</p>
                                        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-[#0f5238]">
                                            {item.label}
                                            {item.external ? <ArrowUpRight className="size-3.5" aria-hidden="true" /> : <ChevronRight className="size-3.5" aria-hidden="true" />}
                                        </span>
                                    </CardContent>
                                </Card>
                            );

                            return item.external ? (
                                <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#0f5238] focus-visible:ring-offset-2">
                                    {content}
                                </a>
                            ) : (
                                <Link key={item.href} href={item.href} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#0f5238] focus-visible:ring-offset-2">
                                    {content}
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </AttendanceLayout>
    );
}
