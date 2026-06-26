import { Link, router } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    Database,
    DoorOpen,
    FileBarChart,
    Home,
    Library,
    Menu,
    Shield,
    Sidebar as SidebarIcon,
    X,
} from 'lucide-react';
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';

import FlashAlerts from '@/components/FlashAlerts';
import { Button } from '@/components/ui/button';
import {
    type AdminNavigationItem,
    type LibraryBreadcrumbItem,
    isNavGroupActive,
    isNavItemActive,
} from '@/config/libraryNavigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { PageProps } from '@/types';
import { cn } from '@/lib/utils';

interface AdminAppShellProps extends PropsWithChildren {
    navigation: AdminNavigationItem[];
    currentPath: string;
    routeName?: string | null;
    breadcrumbs: LibraryBreadcrumbItem[];
    auth: PageProps['auth'];
    adminActivity?: PageProps['adminActivity'] | null;
    flash: PageProps['flash'];
}

export default function AdminAppShell({
    navigation,
    currentPath,
    routeName,
    breadcrumbs,
    auth,
    adminActivity,
    flash,
    children,
}: AdminAppShellProps) {
    const user = auth.user;
    const isAdmin = user?.isAdmin ?? false;
    const currentYear = new Date().getFullYear();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement | null>(null);
    const notificationsRef = useRef<HTMLDivElement | null>(null);

    const [unreadCount, setUnreadCount] = useState(adminActivity?.unreadCount ?? 0);
    const [activities, setActivities] = useState(adminActivity?.activities ?? []);
    const notificationsUrls = adminActivity?.urls ?? {};

    const iconMap = useMemo(() => ({
        Home,
        ClipboardCheck,
        Database,
        BookOpen,
        Library,
        FileBarChart,
        Shield,
        DoorOpen,
    }), []);

    useEffect(() => {
        if (!mobileOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMobileOpen(false);
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [mobileOpen]);

    useEffect(() => {
        const nextDefaults: Record<string, boolean> = {};
        navigation.forEach((item) => {
            if (item.children?.length) {
                nextDefaults[item.label] = isNavGroupActive(item, routeName, currentPath);
            }
        });

        setOpenGroups((previous) => {
            const merged = { ...nextDefaults, ...previous };
            const prevKeys = Object.keys(previous);
            const mergedKeys = Object.keys(merged);

            if (prevKeys.length === mergedKeys.length && mergedKeys.every((key) => previous[key] === merged[key])) {
                return previous;
            }

            return merged;
        });
    }, [navigation, routeName, currentPath]);

    useEffect(() => {
        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (userMenuRef.current && !userMenuRef.current.contains(target)) {
                setUserMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(target)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
        };
    }, []);

    useEffect(() => {
        if (!notificationsUrls.recent) {
            return;
        }

        const fetchRecent = () => {
            fetch(notificationsUrls.recent as string, {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            })
                .then((response) => response.json())
                .then((payload: { unread_count?: number; activities?: typeof activities }) => {
                    setUnreadCount(payload.unread_count ?? 0);
                    setActivities((payload.activities ?? []).slice(0, 8));
                })
                .catch(() => {
                    // Ignore polling failures to avoid interrupting page usage.
                });
        };

        fetchRecent();
        const timer = window.setInterval(fetchRecent, 60000);
        return () => window.clearInterval(timer);
    }, [notificationsUrls.recent]);

    const closeMobileIfNeeded = () => {
        if (mobileOpen) {
            setMobileOpen(false);
        }
    };

    const toggleGroup = (label: string) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            return;
        }

        setOpenGroups((previous) => ({
            ...previous,
            [label]: !previous[label],
        }));
    };

    const handleLogout = () => {
        setLogoutDialogOpen(false);
        router.post('/logout');
    };

    const markNotificationsSeen = async () => {
        if (!notificationsUrls.markSeen) {
            return;
        }

        try {
            await fetch(notificationsUrls.markSeen, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '',
                },
                credentials: 'same-origin',
            });
            setUnreadCount(0);
            setActivities((previous) => previous.map((activity) => ({ ...activity, is_unread: false })));
        } catch {
            // Keep UI responsive even if mark-seen fails.
        }
    };

    const renderAvatar = (sizeClass: string) => (
        user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className={cn(sizeClass, 'rounded-full object-cover')} />
        ) : (
            <div className={cn(sizeClass, 'flex items-center justify-center rounded-full bg-[#23408E] text-xs font-semibold text-white')}>
                {user?.initials ?? 'U'}
            </div>
        )
    );

    const sidebarPanel = (
        <div className="flex h-full flex-col">
            <div className={cn('border-b border-[#E5E7EB] px-2 py-3', isCollapsed ? 'items-center' : '')}>
                <Link
                    href="/book"
                    onClick={closeMobileIfNeeded}
                    className={cn(
                        'flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#F8FAFC]',
                        isCollapsed && 'justify-center',
                    )}
                    title="Home"
                >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white p-0.5 shadow-sm ring-1 ring-[#23408E]/30">
                        <img
                            src="/img/usm_logo_1954.png"
                            alt="University of Southern Mindanao"
                            className="size-full rounded-full object-contain"
                        />
                    </div>
                    {!isCollapsed ? (
                        <div className="min-w-0 leading-tight">
                            <p className="truncate text-sm font-semibold text-foreground">PANTAS</p>
                            <p className="truncate text-[11px] text-muted-foreground">USM Library</p>
                            <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-[#23408E]">
                                Staff Portal
                            </p>
                        </div>
                    ) : null}
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3">
                {!isCollapsed ? (
                    <div className="mb-2 flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        <span className="h-px flex-1 bg-[#E5E7EB]" />
                        Menu
                        <span className="h-px flex-1 bg-[#E5E7EB]" />
                    </div>
                ) : null}

                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const Icon = iconMap[item.icon];
                        const groupActive = isNavGroupActive(item, routeName, currentPath);

                        if (!item.children?.length) {
                            if (!item.href) {
                                return null;
                            }

                            const active = isNavItemActive(item, routeName, currentPath);
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={closeMobileIfNeeded}
                                    title={item.label}
                                    className={cn(
                                        'flex items-center gap-2 rounded-md border-l-[3px] px-3 py-2 text-sm transition-colors',
                                        active
                                            ? 'border-l-[#1f4ea7] bg-[#eaf1ff] text-[#1f4ea7]'
                                            : 'border-l-transparent text-foreground hover:bg-[#F8FAFC]',
                                        isCollapsed && 'justify-center px-2',
                                    )}
                                >
                                    <Icon className="size-4 shrink-0" />
                                    {!isCollapsed ? <span>{item.label}</span> : null}
                                </Link>
                            );
                        }

                        const open = openGroups[item.label] ?? groupActive;

                        return (
                            <div key={item.label}>
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(item.label)}
                                    title={item.label}
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-md border-l-[3px] px-3 py-2 text-sm transition-colors',
                                        groupActive
                                            ? 'border-l-[#1f4ea7] bg-[#eaf1ff] text-[#1f4ea7]'
                                            : 'border-l-transparent text-foreground hover:bg-[#F8FAFC]',
                                        isCollapsed && 'justify-center px-2',
                                    )}
                                >
                                    <Icon className="size-4 shrink-0" />
                                    {!isCollapsed ? (
                                        <>
                                            <span className="flex-1 text-left">{item.label}</span>
                                            <ChevronRight className={cn('size-4 transition-transform', open && 'rotate-90')} />
                                        </>
                                    ) : null}
                                </button>

                                {!isCollapsed && open ? (
                                    <div className="mt-1 space-y-1 border-l border-[#d4e2ff] pl-3">
                                        {item.children.map((child) => {
                                            const active = isNavItemActive(child, routeName, currentPath);
                                            return (
                                                <Link
                                                    key={`${item.label}-${child.label}`}
                                                    href={child.href}
                                                    onClick={closeMobileIfNeeded}
                                                    className={cn(
                                                        'flex items-center gap-2 rounded-md border-l-[3px] px-3 py-2 text-sm transition-colors',
                                                        active
                                                            ? 'border-l-[#1f4ea7] bg-[#eaf1ff] text-[#1f4ea7]'
                                                            : 'border-l-transparent text-foreground hover:bg-[#F8FAFC]',
                                                    )}
                                                >
                                                    <span className={cn('size-1.5 rounded-full', active ? 'bg-[#1f4ea7]' : 'bg-[#9aa6bf]')} />
                                                    <span>{child.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-[#E5E7EB] p-3">
                <Link
                    href="/account"
                    onClick={closeMobileIfNeeded}
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-[#F8FAFC]',
                        isCollapsed && 'justify-center',
                    )}
                    title="My account"
                >
                    {renderAvatar('size-9')}
                    {!isCollapsed ? (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{user?.name ?? 'Staff User'}</p>
                            <span className="inline-block rounded border border-[#1f4ea7]/30 bg-[#1f4ea7]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1f4ea7]">
                                {isAdmin ? 'Administrator' : 'Staff'}
                            </span>
                        </div>
                    ) : null}
                </Link>
                {!isCollapsed ? (
                    <p className="mt-2 text-center text-[10px] text-muted-foreground">
                        Pantas © {currentYear} · University of Southern Mindanao
                    </p>
                ) : null}
            </div>
        </div>
    );

    return (
        <div className="admin-shell flex min-h-svh bg-[#F8FAFC]">
            <aside
                className={cn(
                    'hidden shrink-0 border-r border-[#E5E7EB] bg-white transition-[width] duration-150 lg:block',
                    isCollapsed ? 'w-[76px]' : 'w-[280px]',
                )}
            >
                {sidebarPanel}
            </aside>

            {mobileOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        aria-label="Close navigation"
                        onClick={() => {
                            setMobileOpen(false);
                            setUserMenuOpen(false);
                            setNotificationsOpen(false);
                        }}
                    />
                    <aside className="relative flex h-full w-[min(260px,90vw)] flex-col bg-white shadow-xl">
                        <div className="flex items-center justify-end border-b border-[#E5E7EB] p-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="size-5" />
                            </Button>
                        </div>
                        {sidebarPanel}
                    </aside>
                </div>
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-[70px] shrink-0 items-center gap-3 border-b border-[#E5E7EB] bg-white px-4 shadow-sm">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hidden lg:inline-flex"
                        onClick={() => setIsCollapsed((previous) => !previous)}
                        aria-label="Toggle sidebar"
                    >
                        <SidebarIcon className="size-5" />
                    </Button>

                    <nav
                        aria-label="Breadcrumb"
                        className="hidden min-w-0 flex-1 items-center gap-1.5 text-sm text-muted-foreground sm:flex"
                    >
                        <Home className="size-4 shrink-0" />
                        {breadcrumbs.map((crumb, index) => (
                            <div key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                                {index > 0 ? <span className="text-muted-foreground/60">/</span> : null}
                                {crumb.href && !crumb.isCurrent ? (
                                    <Link
                                        href={crumb.href}
                                        className="truncate hover:text-[#23408E] hover:underline"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span
                                        className={cn(
                                            'truncate',
                                            crumb.isCurrent && 'font-medium text-foreground',
                                        )}
                                    >
                                        {crumb.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        <div className="relative" ref={notificationsRef}>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="relative text-muted-foreground"
                                aria-label="Notifications"
                                onClick={async () => {
                                    const nextOpen = !notificationsOpen;
                                    setNotificationsOpen(nextOpen);
                                    if (nextOpen) {
                                        await markNotificationsSeen();
                                    }
                                }}
                            >
                                <Bell className="size-5" />
                                {unreadCount > 0 ? (
                                    <span className="absolute -right-0.5 -top-0.5 rounded-full bg-[#932c27] px-1.5 text-[10px] font-semibold text-white">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                ) : null}
                            </Button>

                            {notificationsOpen ? (
                                <div className="absolute right-0 z-40 mt-2 w-[320px] rounded-lg border bg-white p-2 shadow-lg">
                                    <div className="mb-2 border-b px-2 pb-2">
                                        <p className="text-sm font-semibold">Notifications</p>
                                        <p className="text-xs text-muted-foreground">Recent patron and admin activities</p>
                                    </div>
                                    <div className="max-h-80 space-y-1 overflow-y-auto">
                                        {activities.length ? activities.map((activity) => (
                                            <Link
                                                key={activity.id}
                                                href={activity.action_url || '#'}
                                                className={cn(
                                                    'block rounded-md px-2 py-2 text-sm transition-colors hover:bg-[#F8FAFC]',
                                                    activity.is_unread && 'bg-[#eef4ff]',
                                                )}
                                                onClick={() => setNotificationsOpen(false)}
                                            >
                                                <p className="font-medium">{activity.title}</p>
                                                {activity.body ? <p className="text-xs text-muted-foreground">{activity.body}</p> : null}
                                                {activity.created_at ? <p className="mt-1 text-[11px] text-muted-foreground">{activity.created_at}</p> : null}
                                            </Link>
                                        )) : (
                                            <p className="px-2 py-3 text-xs text-muted-foreground">No recent notifications.</p>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="relative" ref={userMenuRef}>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-10 rounded-full px-2"
                                onClick={() => setUserMenuOpen((previous) => !previous)}
                                aria-label="Open user menu"
                            >
                                {renderAvatar('size-8')}
                                <ChevronDown className="ml-1 size-4 text-muted-foreground" />
                            </Button>
                            {userMenuOpen ? (
                                <div className="absolute right-0 z-40 mt-2 w-64 rounded-lg border bg-white p-2 shadow-lg">
                                    <div className="border-b px-2 pb-2">
                                        <p className="truncate text-sm font-semibold">{user?.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                    <div className="mt-1 space-y-1">
                                        <Link
                                            href="/account"
                                            className="block rounded-md px-2 py-2 text-sm transition-colors hover:bg-[#F8FAFC]"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            My account
                                        </Link>
                                        <button
                                            type="button"
                                            className="w-full rounded-md px-2 py-2 text-left text-sm text-[#932c27] transition-colors hover:bg-[#fff1f1]"
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                setLogoutDialogOpen(true);
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6">
                    <FlashAlerts flash={flash} />
                    {children}
                </main>

                <footer className="border-t border-[#E5E7EB] bg-white py-3 text-center text-xs text-muted-foreground">
                    JOSE MARIA COLLEGE Foundation Inc. — Library System
                </footer>
            </div>

            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Log out?</DialogTitle>
                        <DialogDescription>
                            You will be signed out of the library admin portal. You can sign back in at any time.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleLogout}>
                            Log out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
