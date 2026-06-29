import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

import { isNavigationItemActive, navigationHref } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { NavigationItem as NavigationItemType } from '@/types/navigation';

interface NavItemProps {
    item: NavigationItemType;
    routeName?: string | null;
    collapsed: boolean;
    onNavigate?: () => void;
}

export default function NavItem({ item, routeName, collapsed, onNavigate }: NavItemProps) {
    const active = isNavigationItemActive(item, routeName);
    const href = navigationHref(item);
    const Icon = item.icon;
    const classes = cn(
        'group/nav relative flex min-h-10 items-center gap-3 rounded-lg border-l-[3px] px-3 py-2 text-sm transition-colors',
        active
            ? 'border-l-[var(--module-accent)] bg-white/14 font-semibold text-white'
            : 'border-l-transparent text-blue-50/82 hover:bg-white/8 hover:text-white',
        collapsed && 'mx-auto size-10 justify-center px-0',
    );
    const contents = (
        <>
            <Icon className={cn('size-[18px] shrink-0', active && 'text-[var(--module-accent)]')} aria-hidden="true" />
            {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
            {!collapsed && item.external && <ExternalLink className="size-3.5 opacity-60" aria-hidden="true" />}
            {!collapsed && item.badge && (
                <span className="rounded-full bg-white/12 px-1.5 py-0.5 text-[10px] font-semibold">{item.badge.label}</span>
            )}
            {collapsed && (
                <span role="tooltip" className="pointer-events-none absolute left-[calc(100%+0.6rem)] z-[70] hidden whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs text-white shadow-lg group-hover/nav:block group-focus-visible/nav:block">
                    {item.label}
                </span>
            )}
        </>
    );

    if (item.external) {
        return <a href={href} target="_blank" rel="noreferrer" className={classes} aria-current={active ? 'page' : undefined} onClick={onNavigate}>{contents}</a>;
    }

    return <Link href={href} className={classes} aria-current={active ? 'page' : undefined} onClick={onNavigate}>{contents}</Link>;
}
