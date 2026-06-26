export type TopNavIcon =
    | 'Home'
    | 'ClipboardCheck'
    | 'Database'
    | 'BookOpen'
    | 'Library'
    | 'FileBarChart'
    | 'Shield'
    | 'DoorOpen';

export interface AdminNavigationChild {
    label: string;
    href: string;
    routeName?: string;
    routePrefix?: string;
    adminOnly?: boolean;
}

export interface AdminNavigationItem {
    label: string;
    href?: string;
    routeName?: string;
    routePrefix?: string;
    icon: TopNavIcon;
    adminOnly?: boolean;
    children?: AdminNavigationChild[];
}

export interface LibraryBreadcrumbItem {
    label: string;
    href: string | null;
    isCurrent: boolean;
}

export const adminNavigation: AdminNavigationItem[] = [
    {
        label: 'Home',
        href: '/book',
        routeName: 'book.index',
        icon: 'Home',
    },
    {
        label: 'Attendance',
        icon: 'ClipboardCheck',
        children: [
            { label: 'Gate Terminal', href: '/attendance', routeName: 'attendance.scan' },
            { label: 'Change Video', href: '/attendance/change-video', routeName: 'attendance.changeVideo' },
            { label: 'Logout Feedback', href: '/attendance/logout-feedback', routeName: 'attendance.feedback.settings' },
        ],
    },
    {
        label: 'Data',
        icon: 'Database',
        children: [
            { label: 'Student Data', href: '/students', routeName: 'students.index', adminOnly: true },
            { label: 'Faculty & Staff Data', href: '/employees', routeName: 'employees.index', adminOnly: true },
        ],
    },
    {
        label: 'OPAC',
        href: '/opac',
        routeName: 'landing',
        icon: 'BookOpen',
    },
    {
        label: 'Circulation',
        icon: 'Library',
        children: [
            { label: 'Circulation', href: '/logs', routeName: 'logs.index', adminOnly: true },
            { label: 'Copy Cataloging', href: '/catalog/copy/openlibrary', routeName: 'catalog.copy.openlibrary.form' },
            { label: 'Circulation Policy', href: '/admin/circulation-policy', routeName: 'circulation.policy.edit', adminOnly: true },
        ],
    },
    {
        label: 'Reports',
        icon: 'FileBarChart',
        children: [
            { label: 'Attendance Logs', href: '/attendance/logs', routeName: 'attendance.logs.index', routePrefix: 'attendance.logs.', adminOnly: true },
            { label: 'Gate Feedback Responses', href: '/attendance/feedbacks', routeName: 'attendance.feedback.index', adminOnly: true },
            { label: 'Outstanding Fines', href: '/admin/fines/outstanding', routeName: 'library.fines.outstanding', routePrefix: 'library.fines.', adminOnly: true },
            { label: 'Library Holdings Report', href: '/reports/library-holdings', routeName: 'library.reports.library_holdings.create', routePrefix: 'library.reports.library_holdings.' },
            { label: 'Download Book Report (PDF)', href: '/download-book-report', routeName: 'library.book.report.download' },
            { label: 'Student Feedback', href: '/feedbacks', routeName: 'library.feedback.index', routePrefix: 'library.feedback.' },
            { label: 'Activity log', href: '/admin/activities', routeName: 'library.admin.activities.index', routePrefix: 'library.admin.activities.' },
            { label: 'Reservation Logs', href: '/rooms/logs', routeName: 'library.rooms.logs', adminOnly: true },
        ],
    },
    {
        label: 'Admin',
        icon: 'Shield',
        children: [
            { label: 'Repository', href: '/files', routeName: 'library.files.index', adminOnly: true },
            { label: 'Prospectus Manager', href: '/prospectus', routeName: 'library.prospectus.index', routePrefix: 'library.prospectus.', adminOnly: true },
            { label: 'View Pantas Users', href: '/view-users', routeName: 'library.users.index', adminOnly: true },
            { label: 'MARC catalog frameworks', href: '/admin/catalog-frameworks', routeName: 'library.admin.catalog_frameworks.index', adminOnly: true },
            { label: 'Catalog dropdown options', href: '/admin/catalog-select-options', routeName: 'library.admin.catalog_select_options.index', adminOnly: true },
            { label: 'SMS Blast', href: '/sms-blast', routeName: 'library.sms.page', adminOnly: true },
        ],
    },
    {
        label: 'Room Reservations',
        icon: 'DoorOpen',
        children: [
            { label: 'Manage Rooms', href: '/rooms', routeName: 'library.rooms.index', adminOnly: true },
            { label: 'Book a Room', href: '/rooms/book', routeName: 'library.rooms.book' },
            { label: 'View Schedule', href: '/rooms/schedule', routeName: 'library.rooms.schedule' },
            { label: 'Pending Reservations', href: '/rooms/pending', routeName: 'library.rooms.pending', adminOnly: true },
        ],
    },
];

function normalizePath(pathname: string): string {
    const basePath = pathname.split('?')[0]?.split('#')[0] ?? '/';
    if (basePath.length > 1 && basePath.endsWith('/')) {
        return basePath.slice(0, -1);
    }
    return basePath || '/';
}

export function filterNavigation(items: AdminNavigationItem[], isAdmin: boolean): AdminNavigationItem[] {
    return items
        .map((item) => {
            if (item.adminOnly && !isAdmin) {
                return null;
            }

            if (item.children?.length) {
                const children = item.children.filter((child) => !child.adminOnly || isAdmin);

                if (children.length === 0) {
                    return null;
                }

                return {
                    ...item,
                    children,
                };
            }

            return item;
        })
        .filter((item): item is AdminNavigationItem => item !== null);
}

export function isNavItemActive(
    item: Pick<AdminNavigationChild, 'href' | 'routeName' | 'routePrefix'>,
    routeName: string | null | undefined,
    pathname: string,
): boolean {
    if (item.routePrefix && routeName?.startsWith(item.routePrefix)) {
        return true;
    }

    if (item.routeName && routeName === item.routeName) {
        return true;
    }

    const normalizedCurrentPath = normalizePath(pathname);
    const normalizedHref = normalizePath(item.href);

    if (normalizedCurrentPath === normalizedHref) {
        return true;
    }

    if (normalizedHref === '/book') {
        return false;
    }

    return normalizedCurrentPath.startsWith(`${normalizedHref}/`);
}

export function isNavGroupActive(
    item: AdminNavigationItem,
    routeName: string | null | undefined,
    pathname: string,
): boolean {
    if (!item.children?.length) {
        if (!item.href) {
            return false;
        }

        return isNavItemActive(
            { href: item.href, routeName: item.routeName, routePrefix: item.routePrefix },
            routeName,
            pathname,
        );
    }

    return item.children.some((child) => isNavItemActive(child, routeName, pathname));
}

export function resolveBreadcrumbs(
    items: AdminNavigationItem[],
    routeName: string | null | undefined,
    pathname: string,
): LibraryBreadcrumbItem[] {
    for (const item of items) {
        if (item.children?.length) {
            const child = item.children.find((entry) => isNavItemActive(entry, routeName, pathname));
            if (child) {
                return [
                    { label: 'Home', href: '/book', isCurrent: false },
                    { label: item.label, href: item.children[0]?.href ?? null, isCurrent: false },
                    { label: child.label, href: null, isCurrent: true },
                ];
            }

            continue;
        }

        if (item.href) {
            const activeRoot = isNavItemActive(
                { href: item.href, routeName: item.routeName, routePrefix: item.routePrefix },
                routeName,
                pathname,
            );

            if (!activeRoot) {
                continue;
            }

            return [
                { label: 'Home', href: '/book', isCurrent: false },
                { label: item.label, href: null, isCurrent: true },
            ];
        }
    }

    return [{ label: 'Home', href: '/book', isCurrent: true }];
}
