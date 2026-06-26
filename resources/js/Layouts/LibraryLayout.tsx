import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    House,
    LogOut,
} from 'lucide-react';

import FlashAlerts from '@/components/FlashAlerts';
import {
    filterLibraryNavigationByRoles,
    isLibraryNavItemActive,
    resolveLibraryBreadcrumb,
} from '@/config/libraryNavigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { PageProps } from '@/types';
import { cn } from '@/lib/utils';

const OPEN_GROUPS_STORAGE_KEY = 'jmc.library-nav-open-groups';

export default function LibraryLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage<PageProps>();
    const { auth, flash } = props;
    const currentPath = url.split('?')[0];
    const userRoles = auth.user?.roles ?? [];

    const navigation = useMemo(
        () => filterLibraryNavigationByRoles(userRoles),
        [userRoles],
    );
    const breadcrumbs = useMemo(
        () => resolveLibraryBreadcrumb(currentPath),
        [currentPath],
    );

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        if (typeof window === 'undefined') {
            return {};
        }

        try {
            const stored = window.localStorage.getItem(OPEN_GROUPS_STORAGE_KEY);
            return stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        setOpenGroups((previous) => {
            const next = { ...previous };

            for (const section of navigation) {
                if (next[section.id] !== undefined) {
                    continue;
                }

                next[section.id] = section.items.some((item) =>
                    isLibraryNavItemActive(currentPath, item),
                );
            }

            return next;
        });
    }, [navigation, currentPath]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(OPEN_GROUPS_STORAGE_KEY, JSON.stringify(openGroups));
    }, [openGroups]);

    const toggleGroup = (groupId: string) => {
        setOpenGroups((previous) => ({
            ...previous,
            [groupId]: !previous[groupId],
        }));
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="border-b bg-primary text-primary-foreground">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide opacity-80">JMC Library</p>
                        <Link href="/dashboard/library-admin" className="text-lg font-semibold">
                            Administration
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {auth.user && (
                            <span className="hidden text-sm sm:inline">{auth.user.fullName}</span>
                        )}
                        <Link href="/logout" method="post" as="button">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                            >
                                <LogOut className="size-4" />
                                Logout
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="border-t border-primary-foreground/15 bg-primary/95">
                    <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2 text-xs text-primary-foreground/90">
                        <House className="size-3.5" />
                        {breadcrumbs.map((crumb, index) => (
                            <div key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                                {index > 0 && <span className="opacity-70">/</span>}
                                {crumb.href && !crumb.isCurrent ? (
                                    <Link href={crumb.href} className="hover:underline">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className={cn(crumb.isCurrent && 'font-semibold text-primary-foreground')}>
                                        {crumb.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
                <aside className="hidden w-56 shrink-0 lg:block">
                    <nav className="sticky top-6 space-y-2 rounded-lg border bg-card p-2 shadow-sm">
                        {navigation.map((section) => {
                            const SectionIcon = section.icon;
                            const isOpen = openGroups[section.id] ?? false;
                            const sectionHasActiveItem = section.items.some((item) =>
                                isLibraryNavItemActive(currentPath, item),
                            );

                            return (
                                <div key={section.id} className="space-y-1">
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(section.id)}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                                            sectionHasActiveItem && 'text-foreground',
                                        )}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <SectionIcon className="size-3.5" />
                                            {section.label}
                                        </span>
                                        {isOpen ? (
                                            <ChevronDown className="size-3.5" />
                                        ) : (
                                            <ChevronRight className="size-3.5" />
                                        )}
                                    </button>

                                    {isOpen && (
                                        <div className="space-y-1">
                                            {section.items.map((item) => {
                                                const active = isLibraryNavItemActive(currentPath, item);
                                                const ItemIcon = item.icon;

                                                return (
                                                    <Link
                                                        key={item.id}
                                                        href={item.href}
                                                        className={cn(
                                                            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                                                            active && 'bg-primary text-primary-foreground hover:bg-primary/90',
                                                        )}
                                                    >
                                                        <ItemIcon className="size-4" />
                                                        {item.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                <main className="min-w-0 flex-1 space-y-4">
                    <FlashAlerts flash={flash} />
                    {children}
                </main>
            </div>

            <Separator />
            <footer className="py-4 text-center text-xs text-muted-foreground">
                JOSE MARIA COLLEGE Foundation Inc. — Library System
            </footer>
        </div>
    );
}
