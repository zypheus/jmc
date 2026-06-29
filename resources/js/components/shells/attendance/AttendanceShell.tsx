import { ChevronLeft, Menu, X } from 'lucide-react';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';

import AppBreadcrumbs from '@/components/app/AppBreadcrumbs';
import FlashAlerts from '@/components/FlashAlerts';
import AttendanceSidebar from '@/components/shells/attendance/AttendanceSidebar';
import LogoutConfirmDialog from '@/components/app/LogoutConfirmDialog';
import ModuleSwitcher from '@/components/app/ModuleSwitcher';
import { Button } from '@/components/ui/button';
import { filterNavigation } from '@/lib/authorization';
import { submitLogout } from '@/lib/logout';
import { resolveBreadcrumbs } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import type { NavigationGroup } from '@/types/navigation';

interface AttendanceShellProps extends PropsWithChildren {
    navigation: NavigationGroup[];
    routeName?: string | null;
    auth: PageProps['auth'];
    flash: PageProps['flash'];
}

const COLLAPSE_STORAGE_KEY = 'jmc.attendance.sidebar.collapsed';

export default function AttendanceShell({
    navigation,
    routeName,
    auth,
    flash,
    children,
}: AttendanceShellProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const visibleNavigation = useMemo(() => filterNavigation(navigation, auth, 'attendance'), [navigation, auth]);
    const breadcrumbs = useMemo(
        () => resolveBreadcrumbs(visibleNavigation, 'attendance', auth, routeName),
        [visibleNavigation, auth, routeName],
    );

    useEffect(() => {
        setCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true');
    }, []);

    useEffect(() => {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
    }, [collapsed]);

    useEffect(() => {
        if (!mobileOpen) return;
        const escape = (event: KeyboardEvent) => event.key === 'Escape' && setMobileOpen(false);
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', escape);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', escape);
        };
    }, [mobileOpen]);

    const sidebar = (isCollapsed: boolean, onNavigate?: () => void) => (
        <AttendanceSidebar
            navigation={visibleNavigation}
            routeName={routeName}
            auth={auth}
            collapsed={isCollapsed}
            onLogout={() => setLogoutOpen(true)}
            onNavigate={onNavigate}
        />
    );

    return (
        <div
            className={cn(
                'attendance-shell admin-shell min-h-svh bg-[#f5f7fa]',
                collapsed && 'attendance-shell--collapsed',
                mobileOpen && 'attendance-shell--mobile-open',
            )}
            data-module="attendance"
        >
            <button
                type="button"
                className="attendance-mobile-trigger lg:hidden"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
            >
                <span /><span /><span />
            </button>

            <button
                type="button"
                className="attendance-collapse-toggle hidden lg:flex"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((value) => !value)}
            >
                <ChevronLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} aria-hidden="true" />
            </button>

            {mobileOpen && (
                <>
                    <button
                        type="button"
                        className="attendance-sidebar-backdrop lg:hidden"
                        aria-label="Close navigation"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="attendance-mobile-drawer lg:hidden">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 z-10"
                            aria-label="Close navigation"
                            onClick={() => setMobileOpen(false)}
                        >
                            <X className="size-5" />
                        </Button>
                        {sidebar(false, () => setMobileOpen(false))}
                    </div>
                </>
            )}

            <div className="attendance-shell-sidebar hidden lg:block">
                {sidebar(collapsed)}
            </div>

            <div className="attendance-shell-content">
                <div className="attendance-shell-topbar">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        aria-label="Open navigation"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="size-5" />
                    </Button>
                    <AppBreadcrumbs items={breadcrumbs} />
                    <div className="ml-auto">
                        <ModuleSwitcher auth={auth} module="attendance" />
                    </div>
                </div>
                <main className="attendance-shell-main">
                    <FlashAlerts flash={flash} />
                    {children}
                </main>
            </div>

            <LogoutConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={submitLogout} />
        </div>
    );
}
