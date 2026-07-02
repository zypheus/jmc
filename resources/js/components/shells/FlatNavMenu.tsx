import { Link } from '@inertiajs/react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

import { isNavigationBranchActive, isNavigationItemActive, navigationHref } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/types/navigation';

export type FlatNavVariant = 'library' | 'attendance';

interface FlatNavMenuProps {
    items: NavigationItem[];
    routeName?: string | null;
    variant: FlatNavVariant;
    collapsed: boolean;
    onNavigate?: () => void;
}

function NavIcon({ item, active, variant }: { item: NavigationItem; active: boolean; variant: FlatNavVariant }) {
    const Icon = item.icon;
    return <Icon className={cn('size-4 shrink-0', variant === 'attendance' && 'sidebar-link__icon', active ? 'opacity-100' : 'opacity-85')} aria-hidden="true" />;
}

function FlatNavLink({
    item,
    routeName,
    variant,
    collapsed,
    onNavigate,
    sub = false,
}: {
    item: NavigationItem;
    routeName?: string | null;
    variant: FlatNavVariant;
    collapsed: boolean;
    onNavigate?: () => void;
    sub?: boolean;
}) {
    const active = isNavigationItemActive(item, routeName);
    const href = navigationHref(item);
    const classes = cn(
        variant === 'library' ? 'library-nav-link' : 'attendance-nav-link',
        sub && 'attendance-nav-sublink library-nav-sublink',
        active && 'is-active',
        collapsed && !sub && 'justify-center px-0',
    );

    const contents = (
        <>
            <span className={variant === 'attendance' ? 'sidebar-link__main' : 'inline-flex min-w-0 flex-1 items-center gap-3'}>
                <NavIcon item={item} active={active} variant={variant} />
                {!collapsed && <span className="truncate">{item.label}</span>}
            </span>
            {!collapsed && item.external && <ExternalLink className="size-3.5 opacity-60" aria-hidden="true" />}
        </>
    );

    if (item.external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={classes}
                data-nav-id={item.id}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
                onClick={onNavigate}
            >
                {contents}
            </a>
        );
    }

    return (
        <Link
            href={href}
            className={classes}
            data-nav-id={item.id}
            aria-current={active ? 'page' : undefined}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
        >
            {contents}
        </Link>
    );
}

function FlatNavSection({
    item,
    routeName,
    variant,
    collapsed,
    onNavigate,
}: {
    item: NavigationItem;
    routeName?: string | null;
    variant: FlatNavVariant;
    collapsed: boolean;
    onNavigate?: () => void;
}) {
    const branchActive = isNavigationBranchActive(item, routeName);
    const [open, setOpen] = useState(branchActive);

    useEffect(() => {
        if (branchActive) {
            setOpen(true);
        }
    }, [branchActive]);

    if (collapsed) {
        const firstChild = item.children?.[0];
        if (!firstChild) {
            return null;
        }

        return <FlatNavLink item={firstChild} routeName={routeName} variant={variant} collapsed onNavigate={onNavigate} />;
    }

    return (
        <div className={cn('flat-nav-section', branchActive && 'is-branch-active')} data-nav-id={item.id}>
            <button
                type="button"
                className={cn(
                    variant === 'library' ? 'library-nav-link' : 'attendance-nav-link',
                    branchActive && 'is-active',
                )}
                data-nav-id={item.id}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <span className={variant === 'attendance' ? 'sidebar-link__main' : 'inline-flex min-w-0 flex-1 items-center gap-3'}>
                    <NavIcon item={item} active={branchActive} variant={variant} />
                    <span className="truncate">{item.label}</span>
                </span>
                <ChevronDown className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')} aria-hidden="true" />
            </button>
            {open && (
                <div className="flat-nav-children">
                    {item.children?.map((child) => (
                        <FlatNavLink
                            key={child.id}
                            item={child}
                            routeName={routeName}
                            variant={variant}
                            collapsed={false}
                            onNavigate={onNavigate}
                            sub
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function FlatNavMenu({ items, routeName, variant, collapsed, onNavigate }: FlatNavMenuProps) {
    return (
        <div className="flat-nav-menu">
            {!collapsed && <p className="flat-nav-menu-label">Menu</p>}
            <div className="flat-nav-items">
                {items.map((item) => (
                    item.children?.length
                        ? (
                            <FlatNavSection
                                key={item.id}
                                item={item}
                                routeName={routeName}
                                variant={variant}
                                collapsed={collapsed}
                                onNavigate={onNavigate}
                            />
                        )
                        : (
                            <FlatNavLink
                                key={item.id}
                                item={item}
                                routeName={routeName}
                                variant={variant}
                                collapsed={collapsed}
                                onNavigate={onNavigate}
                            />
                        )
                ))}
            </div>
        </div>
    );
}
