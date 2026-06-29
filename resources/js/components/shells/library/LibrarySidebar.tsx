import { Link } from '@inertiajs/react';

import FlatNavMenu from '@/components/shells/FlatNavMenu';
import { UserAvatar } from '@/components/app/UserMenu';
import { dashboardRouteFor } from '@/config/modules';
import { activeModuleRole } from '@/lib/authorization';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import type { NavigationGroup } from '@/types/navigation';

interface LibrarySidebarProps {
    navigation: NavigationGroup[];
    routeName?: string | null;
    auth: PageProps['auth'];
    collapsed: boolean;
    onNavigate?: () => void;
}

export default function LibrarySidebar({ navigation, routeName, auth, collapsed, onNavigate }: LibrarySidebarProps) {
    const items = navigation[0]?.items ?? [];
    const dashboardHref = route(dashboardRouteFor('library', auth));
    const activeRole = activeModuleRole(auth, 'library');
    const currentYear = new Date().getFullYear();

    return (
        <div className="library-sidebar flex h-full flex-col">
            <div className="library-sidebar-header">
                <Link
                    href={dashboardHref}
                    className={cn('library-sidebar-brand', collapsed && 'justify-center')}
                    onClick={onNavigate}
                >
                    <span className="library-sidebar-logo">
                        <img src="/images/d.png" alt="" className="size-full object-contain" />
                    </span>
                    {!collapsed && (
                        <span className="min-w-0 leading-tight">
                            <span className="block font-display text-sm font-semibold tracking-tight">PANTAS</span>
                            <span className="block truncate text-[11px] text-sidebar-foreground/70">JMC Library</span>
                            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-primary/90">
                                Staff portal
                            </span>
                        </span>
                    )}
                </Link>
            </div>

            <nav className="library-sidebar-nav flex-1 overflow-y-auto" aria-label="Library navigation">
                <FlatNavMenu
                    items={items}
                    routeName={routeName}
                    variant="library"
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                />
            </nav>

            <div className="library-sidebar-footer">
                <Link
                    href={route('account.edit')}
                    className={cn('library-sidebar-user', collapsed && 'justify-center')}
                    onClick={onNavigate}
                    title={`${auth.user?.name ?? 'Staff'} — ${activeRole}`}
                >
                    <UserAvatar auth={auth} className="size-9 ring-2 ring-sidebar-border/40" />
                    {!collapsed && (
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{auth.user?.name ?? 'Staff User'}</span>
                            <span className="block truncate text-[11px] text-sidebar-foreground/70">{activeRole}</span>
                        </span>
                    )}
                </Link>
                {!collapsed && (
                    <p className="mt-2 text-center text-[10px] text-sidebar-foreground/55">
                        Jose Maria College · {currentYear}
                    </p>
                )}
            </div>
        </div>
    );
}
