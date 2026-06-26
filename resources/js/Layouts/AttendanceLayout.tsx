import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import {
    BarChart3,
    ClipboardCheck,
    LayoutDashboard,
    LogOut,
    QrCode,
    Settings,
    Users,
} from 'lucide-react';

import FlashAlerts from '@/components/FlashAlerts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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

export default function AttendanceLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage<PageProps>();
    const { auth, flash } = props;
    const currentPath = url.split('?')[0];

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="border-b bg-[#2e7d32] text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide opacity-80">JMC Attendance</p>
                        <Link href="/dashboard/attendance-admin" className="text-lg font-semibold">
                            Administration
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {auth.user && (
                            <span className="hidden text-sm sm:inline">{auth.user.fullName}</span>
                        )}
                        <Link href="/logout" method="post" as="button">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                            >
                                <LogOut className="size-4" />
                                Logout
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="h-1.5 bg-[#ffd700]" />
            </header>

            <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
                <aside className="hidden w-56 shrink-0 lg:block">
                    <nav className="sticky top-6 space-y-1 rounded-lg border bg-card p-2 shadow-sm">
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
                                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                                        active && 'bg-[#2e7d32] text-white hover:bg-[#256729]',
                                    )}
                                >
                                    <Icon className="size-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <main className="min-w-0 flex-1 space-y-4">
                    <FlashAlerts flash={flash} />
                    {children}
                </main>
            </div>

            <Separator />
            <footer className="py-4 text-center text-xs text-muted-foreground">
                JOSE MARIA COLLEGE Foundation Inc. - Attendance System
            </footer>
        </div>
    );
}
