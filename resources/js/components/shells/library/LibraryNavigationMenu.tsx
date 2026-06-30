import { Link } from '@inertiajs/react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isNavigationBranchActive, isNavigationItemActive, navigationHref, navigationMode } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { LibraryNavigationCounts } from '@/types';
import type { NavigationBadge, NavigationGroup, NavigationItem } from '@/types/navigation';

const OPEN_SECTIONS_KEY = 'jmc.library.sidebar.open-sections';

interface LibraryNavigationMenuProps {
    groups: NavigationGroup[];
    routeName?: string | null;
    collapsed: boolean;
    counts?: LibraryNavigationCounts | null;
    onNavigate?: () => void;
}

function badgeFor(item: NavigationItem, counts?: LibraryNavigationCounts | null): NavigationBadge | null {
    if (item.badge) {
        return item.badge;
    }

    if (!item.badgeKey || !counts) {
        return null;
    }

    const value = counts[item.badgeKey];
    return value > 0 ? { label: value, tone: item.badgeTone } : null;
}

export function formatNavigationBadge(label: string | number): string {
    const number = typeof label === 'number' ? label : Number(label);
    return Number.isFinite(number) && number > 99 ? '99+' : String(label);
}

function NavigationBadgeView({ badge, compact = false }: { badge: NavigationBadge; compact?: boolean }) {
    const label = formatNavigationBadge(badge.label);

    return (
        <span
            className={cn(
                'library-nav-badge',
                badge.tone === 'warning' && 'is-warning',
                badge.tone === 'danger' && 'is-danger',
                compact && 'is-compact',
            )}
            aria-label={`${badge.label} items need attention`}
        >
            {label}
        </span>
    );
}

function Destination({ item, className, children, onNavigate }: {
    item: NavigationItem;
    className?: string;
    children: ReactNode;
    onNavigate?: () => void;
}) {
    const href = navigationHref(item);
    const mode = navigationMode(item);

    if (mode === 'new-tab') {
        return <a href={href} target="_blank" rel="noreferrer" className={className} onClick={onNavigate}>{children}</a>;
    }

    if (mode === 'document') {
        return <a href={href} className={className} onClick={onNavigate}>{children}</a>;
    }

    return <Link href={href} className={className} onClick={onNavigate}>{children}</Link>;
}

function LinkContents({ item, active, collapsed, counts }: {
    item: NavigationItem;
    active: boolean;
    collapsed: boolean;
    counts?: LibraryNavigationCounts | null;
}) {
    const Icon = item.icon;
    const badge = badgeFor(item, counts);
    const opensNewTab = navigationMode(item) === 'new-tab';

    return (
        <>
            <span className={cn('relative inline-flex min-w-0 flex-1 items-center gap-3', collapsed && 'flex-none')}>
                <Icon className={cn('size-4 shrink-0', active ? 'opacity-100' : 'opacity-85')} aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {collapsed && badge && <NavigationBadgeView badge={badge} compact />}
            </span>
            {!collapsed && (
                <span className="ml-auto flex shrink-0 items-center gap-2">
                    {badge && <NavigationBadgeView badge={badge} />}
                    {opensNewTab && <ExternalLink className="size-3.5 opacity-60" aria-hidden="true" />}
                </span>
            )}
        </>
    );
}

function NavigationLink({ item, routeName, collapsed, counts, sub = false, onNavigate }: {
    item: NavigationItem;
    routeName?: string | null;
    collapsed: boolean;
    counts?: LibraryNavigationCounts | null;
    sub?: boolean;
    onNavigate?: () => void;
}) {
    const active = isNavigationItemActive(item, routeName);
    const className = cn(
        'library-nav-link',
        sub && 'library-nav-sublink',
        active && 'is-active',
        collapsed && 'is-collapsed',
    );
    const link = (
        <Destination item={item} className={className} onNavigate={onNavigate}>
            <LinkContents item={item} active={active} collapsed={collapsed} counts={counts} />
        </Destination>
    );

    if (!collapsed) {
        return link;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>{item.label}</TooltipContent>
        </Tooltip>
    );
}

function CollapsedBranch({ item, routeName, counts, onNavigate }: {
    item: NavigationItem;
    routeName?: string | null;
    counts?: LibraryNavigationCounts | null;
    onNavigate?: () => void;
}) {
    const active = isNavigationBranchActive(item, routeName);
    const Icon = item.icon;

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={cn('library-nav-link is-collapsed', active && 'is-active')}
                            aria-label={item.label}
                            aria-current={active ? 'page' : undefined}
                        >
                            <Icon className="size-4" aria-hidden="true" />
                            <ChevronDown className="absolute bottom-1 right-1 size-2.5 opacity-70" aria-hidden="true" />
                        </button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>{item.label}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="start" sideOffset={10} className="w-64">
                <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    const childBadge = badgeFor(child, counts);
                    return (
                        <DropdownMenuItem key={child.id} asChild>
                            <Destination item={child} onNavigate={onNavigate}>
                                <ChildIcon className="size-4" aria-hidden="true" />
                                <span className="min-w-0 flex-1 truncate">{child.label}</span>
                                {childBadge && <NavigationBadgeView badge={childBadge} />}
                                {navigationMode(child) === 'new-tab' && <ExternalLink className="size-3.5" aria-hidden="true" />}
                            </Destination>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function LibraryNavigationMenu({ groups, routeName, collapsed, counts, onNavigate }: LibraryNavigationMenuProps) {
    const activeBranches = useMemo(
        () => groups.flatMap((group) => group.items)
            .filter((item) => item.children?.length && isNavigationBranchActive(item, routeName))
            .map((item) => item.id),
        [groups, routeName],
    );
    const [openIds, setOpenIds] = useState<string[]>(activeBranches);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const stored = JSON.parse(window.localStorage.getItem(OPEN_SECTIONS_KEY) ?? '[]') as unknown;
            const storedIds = Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : [];
            setOpenIds([...new Set([...storedIds, ...activeBranches])]);
        } catch {
            setOpenIds(activeBranches);
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        setOpenIds((current) => [...new Set([...current, ...activeBranches])]);
    }, [activeBranches]);

    useEffect(() => {
        if (hydrated) {
            window.localStorage.setItem(OPEN_SECTIONS_KEY, JSON.stringify(openIds));
        }
    }, [hydrated, openIds]);

    return (
        <TooltipProvider delayDuration={250}>
            <div className="space-y-4">
                {groups.map((group) => (
                    <section key={group.id} aria-labelledby={collapsed ? undefined : `library-nav-${group.id}`}>
                        {!collapsed && <h2 id={`library-nav-${group.id}`} className="flat-nav-menu-label">{group.label}</h2>}
                        <div className="flat-nav-items">
                            {group.items.map((item) => {
                                if (!item.children?.length) {
                                    return (
                                        <NavigationLink
                                            key={item.id}
                                            item={item}
                                            routeName={routeName}
                                            collapsed={collapsed}
                                            counts={counts}
                                            onNavigate={onNavigate}
                                        />
                                    );
                                }

                                if (collapsed) {
                                    return (
                                        <CollapsedBranch
                                            key={item.id}
                                            item={item}
                                            routeName={routeName}
                                            counts={counts}
                                            onNavigate={onNavigate}
                                        />
                                    );
                                }

                                const active = isNavigationBranchActive(item, routeName);
                                const open = openIds.includes(item.id);
                                const Icon = item.icon;
                                return (
                                    <div key={item.id} className={cn('flat-nav-section', active && 'is-branch-active')}>
                                        <button
                                            type="button"
                                            className={cn('library-nav-link', active && 'is-active')}
                                            aria-expanded={open}
                                            aria-controls={`library-nav-children-${item.id}`}
                                            onClick={() => {
                                                if (active && open) return;
                                                setOpenIds((current) => current.includes(item.id)
                                                    ? current.filter((id) => id !== item.id)
                                                    : [...current, item.id]);
                                            }}
                                        >
                                            <span className="inline-flex min-w-0 flex-1 items-center gap-3">
                                                <Icon className="size-4 shrink-0" aria-hidden="true" />
                                                <span className="truncate">{item.label}</span>
                                            </span>
                                            <ChevronDown className={cn('size-4 shrink-0 transition-transform motion-reduce:transition-none', open && 'rotate-180')} aria-hidden="true" />
                                        </button>
                                        {open && (
                                            <div id={`library-nav-children-${item.id}`} className="flat-nav-children">
                                                {item.children.map((child) => (
                                                    <NavigationLink
                                                        key={child.id}
                                                        item={child}
                                                        routeName={routeName}
                                                        collapsed={false}
                                                        counts={counts}
                                                        sub
                                                        onNavigate={onNavigate}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </TooltipProvider>
    );
}
