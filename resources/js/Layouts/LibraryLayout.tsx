import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import AdminAppShell from '@/components/layout/AdminAppShell';
import {
    filterLibraryNavigationByRoles,
    isLibraryNavItemActive,
    resolveLibraryBreadcrumb,
} from '@/config/libraryNavigation';
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

    const dashboardHref = userRoles.includes('library_admin')
        ? '/dashboard/library-admin'
        : '/dashboard/library-staff';

    const sidebar = (
        <nav className="space-y-1">
            {navigation.map((section) => {
                const SectionIcon = section.icon;
                const isOpen = openGroups[section.id] ?? false;
                const sectionHasActiveItem = section.items.some((item) =>
                    isLibraryNavItemActive(currentPath, item),
                );

                return (
                    <div key={section.id} className="space-y-0.5">
                        <button
                            type="button"
                            onClick={() => toggleGroup(section.id)}
                            className={cn(
                                'flex w-full items-center justify-between rounded-[10px] px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-[#F8FAFC] hover:text-foreground',
                                sectionHasActiveItem && 'text-[#23408E]',
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <SectionIcon className="size-3.5" />
                                {section.label}
                            </span>
                            {isOpen ? (
                                <ChevronDown className="size-3.5" />
                            ) : (
                                <ChevronRight className="size-3.5" />
                            )}
                        </button>

                        {isOpen ? (
                            <div className="space-y-0.5 pb-1 pl-1">
                                {section.items.map((item) => {
                                    const active = isLibraryNavItemActive(currentPath, item);
                                    const ItemIcon = item.icon;

                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150',
                                                active
                                                    ? 'bg-[#23408E] text-white shadow-sm'
                                                    : 'text-foreground hover:bg-[#F8FAFC]',
                                            )}
                                        >
                                            <ItemIcon className="size-4 shrink-0" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </nav>
    );

    return (
        <AdminAppShell
            brandHref={dashboardHref}
            brandTitle="PANTAS"
            brandSubtitle="JMC Library"
            footerText="JOSE MARIA COLLEGE Foundation Inc. — Library System"
            breadcrumbs={breadcrumbs}
            sidebar={sidebar}
            auth={auth}
            flash={flash}
        >
            {children}
        </AdminAppShell>
    );
}
