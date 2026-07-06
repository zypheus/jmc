import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeftRight,
    ArrowUpRight,
    BarChart3,
    BookOpen,
    CalendarCheck,
    ChevronRight,
    CircleDollarSign,
    FileArchive,
    Hourglass,
    LibraryBig,
    Settings2,
    ShieldAlert,
    UserRoundCheck,
    Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { LibraryDashboardStats, PageProps } from '@/types';

interface LibraryAdminPageProps extends PageProps {
    stats: LibraryDashboardStats;
}

const metricCards = [
    { key: 'studentsCount', label: 'Students', href: '/students', icon: Users, tone: 'bg-blue-50 text-blue-800' },
    { key: 'employeesCount', label: 'Employees', href: '/employees', icon: Users, tone: 'bg-emerald-50 text-emerald-800' },
    { key: 'booksCount', label: 'Book copies', href: '/books?show_all=1', icon: BookOpen, tone: 'bg-violet-50 text-violet-800' },
    { key: 'activeLoansCount', label: 'Active loans', href: '/logs', icon: ArrowLeftRight, tone: 'bg-amber-50 text-amber-800' },
] as const;

const modules = [
    { title: 'Catalog', description: 'Manage full bibliographic records and material metadata.', href: '/books', label: 'Manage catalog', icon: LibraryBig, tone: 'bg-slate-100 text-slate-700', featured: false, external: false },
    { title: 'Circulation', description: 'Track check-outs, returns, and transaction queues.', href: '/logs', label: 'View circulation', icon: ArrowLeftRight, tone: 'bg-emerald-50 text-emerald-800', featured: false, external: false },
    { title: 'Patrons', description: 'Directory of students, faculty, and community members.', href: '/students', label: 'Manage patrons', icon: Users, tone: 'bg-indigo-50 text-indigo-800', featured: true, external: false },
    { title: 'Pending approvals', description: 'Review new account requests and resolve exceptions.', href: '/pending', label: 'Review queue', icon: UserRoundCheck, tone: 'bg-rose-50 text-rose-800', featured: false, external: false },
    { title: 'OPAC', description: 'Open the public access catalog experience for students.', href: '/opac', label: 'View portal', icon: BookOpen, tone: 'bg-amber-50 text-amber-800', featured: false, external: true },
    { title: 'Fines & policy', description: 'Configure borrowing rules and daily fine rates.', href: '/admin/circulation-policy', label: 'Edit policy', icon: Settings2, tone: 'bg-slate-100 text-slate-700', featured: false, external: false },
    { title: 'Outstanding fines', description: 'Monitor unsettled balances and manage clearance.', href: '/admin/fines/outstanding', label: 'Open fines', icon: CircleDollarSign, tone: 'bg-rose-50 text-rose-800', featured: false, external: false },
    { title: 'Repository', description: 'Store and manage local and institutional documents.', href: '/files', label: 'Browse files', icon: FileArchive, tone: 'bg-cyan-50 text-cyan-800', featured: false, external: false },
    { title: 'Reports', description: 'Generate institutional analysis and usage summaries.', href: '/reports/library-holdings', label: 'Open reports', icon: BarChart3, tone: 'bg-slate-100 text-slate-700', featured: false, external: false },
    { title: 'Attendance logs', description: 'Review library entry and exit activity.', href: '/library/attendance/logs', label: 'View logs', icon: CalendarCheck, tone: 'bg-blue-50 text-blue-800', featured: false, external: false },
] as const;

export default function LibraryAdmin({ stats, auth }: LibraryAdminPageProps) {
    const firstName = auth.user?.fname;

    return (
        <LibraryLayout>
            <Head title="Library Admin Dashboard" />

            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <section className="relative overflow-hidden rounded-xl bg-[#0f5238] text-white" aria-labelledby="library-dashboard-title">
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#facc15]" aria-hidden="true" />
                    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <h1 id="library-dashboard-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                                Welcome back{firstName ? `, ${firstName}` : ''}
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-emerald-50/90 sm:text-base">
                                Your library command center is ready for catalog, circulation, patron, and reporting tasks.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href="/pending" className="min-w-36 rounded-lg bg-emerald-950/40 px-4 py-3 outline-none transition-colors hover:bg-emerald-950/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f5238]">
                                <span className="flex items-center gap-2 text-xs font-medium text-emerald-50">
                                    <Hourglass className="size-4" aria-hidden="true" /> Pending requests
                                </span>
                                <strong className="mt-1 block text-2xl font-semibold tabular-nums">{stats.pendingCount}</strong>
                            </Link>
                            <Link href="/admin/fines/outstanding" className="min-w-36 rounded-lg bg-emerald-950/40 px-4 py-3 outline-none transition-colors hover:bg-emerald-950/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f5238]">
                                <span className="flex items-center gap-2 text-xs font-medium text-emerald-50">
                                    <ShieldAlert className="size-4" aria-hidden="true" /> Unpaid fines
                                </span>
                                <strong className="mt-1 block text-2xl font-semibold tabular-nums">{stats.outstandingFinesCount}</strong>
                            </Link>
                        </div>
                    </div>
                </section>

                <section aria-labelledby="library-actions-title">
                    <h2 id="library-actions-title" className="mb-3 text-sm font-medium text-slate-600">Command center</h2>
                    <div className="grid gap-3 lg:grid-cols-2">
                        <Link href="/staff-users" className="group flex min-h-20 items-center gap-4 rounded-xl bg-[#23408e] p-4 text-white outline-none transition-colors hover:bg-[#1d3578] focus-visible:ring-2 focus-visible:ring-[#23408e] focus-visible:ring-offset-2">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/12">
                                <Users className="size-5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <strong className="block text-sm font-semibold">Manage library staff</strong>
                                <span className="mt-0.5 block text-xs text-blue-100">Grant permissions and maintain administration access.</span>
                            </span>
                            <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </Link>
                        <Link href="/books" className="group flex min-h-20 items-center gap-4 rounded-xl bg-[#2e7d32] p-4 text-white outline-none transition-colors hover:bg-[#256829] focus-visible:ring-2 focus-visible:ring-[#2e7d32] focus-visible:ring-offset-2">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/12">
                                <BookOpen className="size-5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <strong className="block text-sm font-semibold">Add catalog record</strong>
                                <span className="mt-0.5 block text-xs text-emerald-100">Register new books, journals, or digital assets.</span>
                            </span>
                            <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </Link>
                    </div>
                </section>

                <section aria-label="Library overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => {
                        const Icon = metric.icon;

                        return (
                            <Link key={metric.key} href={metric.href} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#23408e] focus-visible:ring-offset-2">
                                <Card className="h-full rounded-xl border-slate-200 py-0 shadow-none transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out group-hover:-translate-y-1 group-hover:border-[#2e7d32]/55 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-900/10 group-focus-visible:-translate-y-1 group-focus-visible:border-[#2e7d32]/55 group-focus-visible:shadow-lg group-focus-visible:shadow-slate-900/10">
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 ease-out group-hover:scale-110 group-focus-visible:scale-110 ${metric.tone}`}>
                                            <Icon className="size-4.5" aria-hidden="true" />
                                        </span>
                                        <span>
                                            <strong className="block text-2xl font-semibold tabular-nums tracking-tight text-slate-950 transition-colors group-hover:text-[#0f5238] group-focus-visible:text-[#0f5238]">{stats[metric.key]}</strong>
                                            <span className="text-xs text-slate-500 transition-colors group-hover:text-slate-700 group-focus-visible:text-slate-700">{metric.label}</span>
                                        </span>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </section>

                <section aria-labelledby="library-modules-title">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 id="library-modules-title" className="text-lg font-semibold text-[#0f5238]">Library modules</h2>
                            <p className="mt-1 text-sm text-slate-600">Choose an area to continue managing library operations.</p>
                        </div>
                        <Badge variant="secondary" className="rounded-full px-3 py-1">{modules.length} active</Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {modules.map((item) => {
                            const Icon = item.icon;
                            const content = (
                                <Card className={`h-full rounded-xl py-0 shadow-none transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out group-hover:-translate-y-1 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-900/10 group-focus-visible:-translate-y-1 group-focus-visible:shadow-lg group-focus-visible:shadow-slate-900/10 ${item.featured ? 'border-[#23408e] group-hover:border-[#23408e]' : 'border-slate-200 group-hover:border-[#2e7d32]/55 group-focus-visible:border-[#2e7d32]/55'}`}>
                                    <CardContent className="flex min-h-52 flex-col p-5">
                                        <span className={`flex size-10 items-center justify-center rounded-lg transition-transform duration-200 ease-out group-hover:scale-110 group-focus-visible:scale-110 ${item.tone}`}>
                                            <Icon className="size-5" aria-hidden="true" />
                                        </span>
                                        <h3 className="mt-5 text-base font-semibold text-slate-950 transition-colors group-hover:text-[#0f5238] group-focus-visible:text-[#0f5238]">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-5 text-slate-600">{item.description}</p>
                                        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-[#23408e]">
                                            {item.label}
                                            {item.external ? <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5" aria-hidden="true" /> : <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1" aria-hidden="true" />}
                                        </span>
                                    </CardContent>
                                </Card>
                            );

                            return item.external ? (
                                <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#23408e] focus-visible:ring-offset-2">{content}</a>
                            ) : (
                                <Link key={item.href} href={item.href} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#23408e] focus-visible:ring-offset-2">{content}</Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </LibraryLayout>
    );
}
