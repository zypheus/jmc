import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import {
    BarChart3,
    ClipboardCheck,
    LayoutDashboard,
    QrCode,
    Settings,
    Users,
} from 'lucide-react';

import AdminAppShell from '@/components/layout/AdminAppShell';
import type { LibraryBreadcrumbItem } from '@/config/libraryNavigation';
import type { PageProps } from '@/types';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/dashboard/attendance-admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/attendance', label: 'Kiosk', icon: QrCode },
    { href: '/attendance/pending', label: 'Pending', icon: ClipboardCheck },
    { href: '/attendance/students', label: 'Students', icon: Users },
    { href: '/attendance/employees', label: 'Employees', icon: Users },
    { href: '/attendance/logs', label: 'Logs', icon: ClipboardCheck },
    { href: '/attendance/logs/reports', label: 'Reports', icon: BarChart3 },
    { href: '/attendance/section-picker', label: 'Settings', icon: Settings },
];

function resolveAttendanceBreadcrumb(currentPath: string): LibraryBreadcrumbItem[] {
    const match = navItems.find((item) =>
        item.exact ? currentPath === item.href : currentPath.startsWith(item.href),
    );

    return [
        { label: 'Attendance', href: '/dashboard/attendance-admin', isCurrent: false },
        {
            label: match?.label ?? 'Administration',
            href: null,
            isCurrent: true,
        },
    ];
}

export default function AttendanceLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage<PageProps>();
    const { auth, flash } = props;
    const currentPath = url.split('?')[0];
    const breadcrumbs = resolveAttendanceBreadcrumb(currentPath);

    const sidebar = (
        <nav className="space-y-0.5">
            {navItems.map((item) => {
                const active = item.exact
                    ? currentPath === item.href
                    : currentPath.startsWith(item.href);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150',
                            active
                                ? 'bg-[#23408E] text-white shadow-sm'
                                : 'text-foreground hover:bg-[#F8FAFC]',
                        )}
                    >
                        <Icon className="size-4 shrink-0" />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <AdminAppShell
            brandHref="/dashboard/attendance-admin"
            brandTitle="PANTAS"
            brandSubtitle="JMC Attendance"
            portalLabel="Admin portal"
            footerText="JOSE MARIA COLLEGE Foundation Inc. — Attendance System"
            breadcrumbs={breadcrumbs}
            sidebar={sidebar}
            auth={auth}
            flash={flash}
        >
            {children}
        </AdminAppShell>
    );
}
