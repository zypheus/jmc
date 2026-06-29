import { Menu, PanelLeft, X } from 'lucide-react';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';

import AppBreadcrumbs from '@/components/app/AppBreadcrumbs';
import FlashAlerts from '@/components/FlashAlerts';
import LibrarySidebar from '@/components/shells/library/LibrarySidebar';
import ModuleSwitcher from '@/components/app/ModuleSwitcher';
import NotificationMenu from '@/components/app/NotificationMenu';
import UserMenu from '@/components/app/UserMenu';
import { Button } from '@/components/ui/button';
import { filterNavigation } from '@/lib/authorization';
import { submitLogout } from '@/lib/logout';
import { resolveBreadcrumbs } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import type { NavigationGroup } from '@/types/navigation';

interface LibraryShellProps extends PropsWithChildren {
    navigation: NavigationGroup[];
    routeName?: string | null;
    auth: PageProps['auth'];
    adminActivity?: PageProps['adminActivity'] | null;
    flash: PageProps['flash'];
}

const COLLAPSE_STORAGE_KEY = 'jmc.library.sidebar.collapsed';

export default function LibraryShell({
    navigation,
    routeName,
    auth,
    adminActivity,
    flash,
    children,
}: LibraryShellProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const visibleNavigation = useMemo(() => filterNavigation(navigation, auth, 'library'), [navigation, auth]);
    const breadcrumbs = useMemo(
        () => resolveBreadcrumbs(visibleNavigation, 'library', auth, routeName),
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
        <LibrarySidebar
            navigation={visibleNavigation}
            routeName={routeName}
            auth={auth}
            collapsed={isCollapsed}
            onNavigate={onNavigate}
        />
    );

    return (
        <div className="library-shell admin-shell flex min-h-svh bg-[var(--jmc-page)]" data-module="library">
            <aside
                className={cn(
                    'library-shell-aside sticky top-0 hidden h-svh shrink-0 transition-[width] duration-200 lg:block',
                    collapsed ? 'w-[68px]' : 'w-[280px]',
                )}
            >
                {sidebar(collapsed)}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-[80] lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/55"
                        aria-label="Close navigation"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="library-shell-aside relative h-full w-[min(288px,88vw)] shadow-2xl">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 z-10 text-sidebar-foreground hover:bg-sidebar-accent/25"
                            aria-label="Close navigation"
                            onClick={() => setMobileOpen(false)}
                        >
                            <X className="size-5" />
                        </Button>
                        {sidebar(false, () => setMobileOpen(false))}
                    </aside>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="library-shell-header sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-white/96 px-3 backdrop-blur md:px-5">
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
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hidden lg:inline-flex"
                        aria-label="Collapse navigation"
                        onClick={() => setCollapsed((value) => !value)}
                    >
                        <PanelLeft className="size-5" />
                    </Button>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <AppBreadcrumbs items={breadcrumbs} />
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-1.5">
                        <ModuleSwitcher auth={auth} module="library" />
                        <NotificationMenu payload={adminActivity} />
                        <UserMenu auth={auth} onLogout={submitLogout} />
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6 xl:p-8">
                    <FlashAlerts flash={flash} />
                    {children}
                </main>
            </div>

        </div>
    );
}
