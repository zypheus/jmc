import { X } from 'lucide-react';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';

import AppHeader from '@/components/app/AppHeader';
import AppSidebar from '@/components/app/AppSidebar';
import LogoutConfirmDialog from '@/components/app/LogoutConfirmDialog';
import FlashAlerts from '@/components/FlashAlerts';
import { Button } from '@/components/ui/button';
import { filterNavigation } from '@/lib/authorization';
import { submitLogout } from '@/lib/logout';
import { isNavigationBranchActive, resolveBreadcrumbs } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import type { AppModule, NavigationGroup } from '@/types/navigation';

interface AdminAppShellProps extends PropsWithChildren {
    module: AppModule;
    navigation: NavigationGroup[];
    routeName?: string | null;
    auth: PageProps['auth'];
    adminActivity?: PageProps['adminActivity'] | null;
    flash: PageProps['flash'];
}

const COLLAPSE_STORAGE_KEY = 'jmc.staff.sidebar.collapsed';

export default function AdminAppShell({ module, navigation, routeName, auth, adminActivity, flash, children }: AdminAppShellProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openGroupId, setOpenGroupId] = useState<string | null>(null);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const visibleNavigation = useMemo(() => filterNavigation(navigation, auth, module), [navigation, auth, module]);
    const breadcrumbs = useMemo(
        () => resolveBreadcrumbs(visibleNavigation, module, auth, routeName),
        [visibleNavigation, module, auth, routeName],
    );

    useEffect(() => {
        setCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true');
    }, []);

    useEffect(() => {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
    }, [collapsed]);

    useEffect(() => {
        const activeGroup = visibleNavigation.find((group) => group.items.some((item) => isNavigationBranchActive(item, routeName)));
        setOpenGroupId((current) => activeGroup?.id ?? current ?? visibleNavigation[0]?.id ?? null);
    }, [visibleNavigation, routeName]);

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

    const toggleGroup = (groupId: string, active: boolean) => {
        if (active && openGroupId === groupId) return;
        setOpenGroupId((current) => current === groupId ? null : groupId);
    };

    const sidebar = (isCollapsed: boolean, onNavigate?: () => void) => (
        <AppSidebar
            module={module}
            navigation={visibleNavigation}
            routeName={routeName}
            auth={auth}
            collapsed={isCollapsed}
            openGroupId={openGroupId}
            onGroupToggle={toggleGroup}
            onNavigate={onNavigate}
        />
    );

    return (
        <div className="admin-shell flex min-h-svh bg-[var(--jmc-page)]" data-module={module}>
            <aside className={cn('sticky top-0 hidden h-svh shrink-0 transition-[width] duration-200 lg:block', collapsed ? 'w-[68px]' : 'w-[280px]')}>
                {sidebar(collapsed)}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-[80] lg:hidden">
                    <button type="button" className="absolute inset-0 bg-slate-950/55" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
                    <aside className="relative h-full w-[min(288px,88vw)] shadow-2xl">
                        <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 z-10 text-white hover:bg-white/10 hover:text-white" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
                            <X className="size-5" />
                        </Button>
                        {sidebar(false, () => setMobileOpen(false))}
                    </aside>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <AppHeader
                    module={module}
                    auth={auth}
                    breadcrumbs={breadcrumbs}
                    adminActivity={adminActivity}
                    onOpenMobile={() => setMobileOpen(true)}
                    onToggleCollapsed={() => setCollapsed((value) => !value)}
                    onLogout={() => setLogoutOpen(true)}
                />
                <main className="flex-1 p-4 md:p-6 xl:p-8">
                    <FlashAlerts flash={flash} />
                    {children}
                </main>
            </div>

            <LogoutConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={submitLogout} />
        </div>
    );
}
