import { Menu, PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';

import AppBreadcrumbs from '@/components/app/AppBreadcrumbs';
import FlashAlerts from '@/components/FlashAlerts';
import LibrarySidebar from '@/components/shells/library/LibrarySidebar';
import LibraryNavigationCommand from '@/components/shells/library/LibraryNavigationCommand';
import LogoutConfirmDialog from '@/components/app/LogoutConfirmDialog';
import ModuleSwitcher from '@/components/app/ModuleSwitcher';
import NotificationMenu from '@/components/app/NotificationMenu';
import UserMenu from '@/components/app/UserMenu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { filterNavigation } from '@/lib/authorization';
import { submitLogout } from '@/lib/logout';
import { resolveBreadcrumbs } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { LibraryNavigationCounts, LibraryNavigationStatus, PageProps } from '@/types';
import type { NavigationGroup } from '@/types/navigation';

interface LibraryShellProps extends PropsWithChildren {
    navigation: NavigationGroup[];
    routeName?: string | null;
    auth: PageProps['auth'];
    adminActivity?: PageProps['adminActivity'] | null;
    navigationStatus?: LibraryNavigationStatus | null;
    flash: PageProps['flash'];
}

const COLLAPSE_STORAGE_KEY = 'jmc.library.sidebar.collapsed';

export default function LibraryShell({
    navigation,
    routeName,
    auth,
    adminActivity,
    navigationStatus,
    flash,
    children,
}: LibraryShellProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [navigationSearchOpen, setNavigationSearchOpen] = useState(false);
    const [navigationCounts, setNavigationCounts] = useState<LibraryNavigationCounts | null>(navigationStatus?.counts ?? null);
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

    useEffect(() => setNavigationCounts(navigationStatus?.counts ?? null), [navigationStatus?.counts]);

    useEffect(() => {
        if (!navigationStatus?.refreshUrl) return;

        let lastFetchedAt = Date.now();
        const refresh = async () => {
            if (document.visibilityState !== 'visible') return;
            try {
                const response = await fetch(navigationStatus.refreshUrl, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!response.ok) return;
                const result = await response.json() as { counts?: LibraryNavigationCounts };
                if (result.counts) setNavigationCounts(result.counts);
                lastFetchedAt = Date.now();
            } catch {
                // Keep the last known counts if background refresh is unavailable.
            }
        };
        const timer = window.setInterval(refresh, 60000);
        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible' && Date.now() - lastFetchedAt >= 60000) void refresh();
        };
        document.addEventListener('visibilitychange', refreshWhenVisible);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
        };
    }, [navigationStatus?.refreshUrl]);

    const sidebar = (isCollapsed: boolean, onNavigate?: () => void) => (
        <LibrarySidebar
            navigation={visibleNavigation}
            routeName={routeName}
            auth={auth}
            collapsed={isCollapsed}
            counts={navigationCounts}
            onNavigate={onNavigate}
        />
    );

    return (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="library-shell admin-shell flex min-h-svh bg-[var(--jmc-page)]" data-module="library">
            <aside
                className={cn(
                    'library-shell-aside sticky top-0 hidden h-svh shrink-0 transition-[width] duration-200 lg:block',
                    collapsed ? 'w-[68px]' : 'w-[280px]',
                )}
            >
                {sidebar(collapsed)}
            </aside>

            <SheetContent
                    side="left"
                    showCloseButton={false}
                    className="library-shell-aside library-mobile-sheet w-[min(288px,88vw)] gap-0 border-r p-0 text-sidebar-foreground sm:max-w-[288px]"
                >
                    <SheetTitle className="sr-only">Library navigation</SheetTitle>
                    <SheetDescription className="sr-only">Navigate library administration tools and public services.</SheetDescription>
                    <SheetClose asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 z-10 min-h-11 min-w-11 text-sidebar-foreground hover:bg-sidebar-accent/25"
                            aria-label="Close navigation"
                        >
                            <X className="size-5" />
                        </Button>
                    </SheetClose>
                    {sidebar(false, () => setMobileOpen(false))}
            </SheetContent>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="library-shell-header sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-white/96 px-3 backdrop-blur md:px-5">
                    <SheetTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hidden lg:inline-flex"
                        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
                        onClick={() => setCollapsed((value) => !value)}
                    >
                        {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
                    </Button>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <AppBreadcrumbs items={breadcrumbs} />
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-1.5">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 bg-white px-2.5 text-muted-foreground xl:min-w-48 xl:justify-start"
                            aria-label="Search library navigation"
                            aria-keyshortcuts="Control+K Meta+K"
                            onClick={() => setNavigationSearchOpen(true)}
                        >
                            <Search className="size-4" aria-hidden="true" />
                            <span className="hidden xl:inline">Search navigation</span>
                            <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] xl:inline">Ctrl K</kbd>
                        </Button>
                        <ModuleSwitcher auth={auth} module="library" />
                        <NotificationMenu payload={adminActivity} />
                        <UserMenu auth={auth} currentModule="library" onLogout={() => setLogoutOpen(true)} />
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6 xl:p-8">
                    <FlashAlerts flash={flash} />
                    {children}
                </main>
            </div>

            <LogoutConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={submitLogout} />
            <LibraryNavigationCommand
                groups={visibleNavigation}
                open={navigationSearchOpen}
                onOpenChange={setNavigationSearchOpen}
            />
        </div>
        </Sheet>
    );
}
