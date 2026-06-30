import { Link } from '@inertiajs/react';

import NavGroup from '@/components/app/NavGroup';
import NavItem from '@/components/app/NavItem';
import { UserAvatar } from '@/components/app/UserMenu';
import { moduleDefinitions } from '@/config/modules';
import { activeModuleRole } from '@/lib/authorization';
import { dashboardRouteFor } from '@/config/modules';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import type { AppModule, NavigationGroup } from '@/types/navigation';

interface AppSidebarProps {
    module: AppModule;
    navigation: NavigationGroup[];
    routeName?: string | null;
    auth: PageProps['auth'];
    collapsed: boolean;
    openGroupId: string | null;
    onGroupToggle: (groupId: string, active: boolean) => void;
    onNavigate?: () => void;
}

export default function AppSidebar({ module, navigation, routeName, auth, collapsed, openGroupId, onGroupToggle, onNavigate }: AppSidebarProps) {
    const details = moduleDefinitions[module];
    const activeRole = activeModuleRole(auth, module);
    const dashboardHref = route(dashboardRouteFor(module, auth));
    const currentYear = new Date().getFullYear();

    return (
        <div className="flex h-full flex-col bg-[var(--jmc-navy)] text-white">
            <div className="border-b border-white/10 p-3">
                <Link href={dashboardHref} className={cn('flex items-center gap-3 rounded-xl p-2 hover:bg-white/8', collapsed && 'justify-center px-0')} onClick={onNavigate}>
                    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 ring-2 ring-white/20">
                        <img src="/images/d.png" alt="" className="size-full object-contain" />
                    </span>
                    {!collapsed && (
                        <span className="min-w-0 leading-tight">
                            <span className="block font-display text-lg font-bold tracking-tight">JMC</span>
                            <span className="block truncate text-[11px] text-blue-100/78">Integrated School System</span>
                            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/62">Staff Portal</span>
                        </span>
                    )}
                </Link>
                {!collapsed && (
                    <div className="mt-2 flex items-center gap-2 px-2">
                        <span className="h-2 w-2 rounded-full bg-[var(--module-accent)]" aria-hidden="true" />
                        <span className="rounded-full bg-[var(--module-accent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--module-accent-foreground)]">
                            {details.shortLabel}
                        </span>
                    </div>
                )}
            </div>

            <nav className="flex-1 space-y-2 overflow-x-hidden overflow-y-auto px-2 py-3" aria-label={`${details.label} navigation`}>
                {collapsed
                    ? navigation.flatMap((group) => group.items).map((item) => <NavItem key={item.id} item={item} routeName={routeName} collapsed onNavigate={onNavigate} />)
                    : navigation.map((group) => {
                        const active = group.items.some((item) => item.routeName === routeName || item.routePrefixes?.some((prefix) => routeName?.startsWith(prefix)));
                        return <NavGroup key={group.id} group={group} routeName={routeName} open={openGroupId === group.id} onToggle={() => onGroupToggle(group.id, Boolean(active))} onNavigate={onNavigate} />;
                    })}
            </nav>

            <div className="border-t border-white/10 p-3">
                <Link href={route('account.edit')} className={cn('flex items-center gap-2 rounded-lg p-2 hover:bg-white/8', collapsed && 'justify-center')} onClick={onNavigate} title={`${auth.user?.name ?? 'Staff'} — ${activeRole}`}>
                    <UserAvatar auth={auth} className="size-9" />
                    {!collapsed && (
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{auth.user?.name ?? 'Staff User'}</span>
                            <span className="block truncate text-[11px] text-blue-100/68">{activeRole}</span>
                        </span>
                    )}
                </Link>
                {!collapsed && <p className="mt-2 text-center text-[10px] text-blue-100/52">Jose Maria College · {currentYear}</p>}
            </div>
        </div>
    );
}
