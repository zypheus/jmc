import type { LucideIcon } from 'lucide-react';
import {
    Archive,
    BookCopy,
    BookOpen,
    Building2,
    ClipboardList,
    DoorOpen,
    FileBarChart2,
    Files,
    FolderCog,
    GraduationCap,
    Home,
    LayoutDashboard,
    ListTree,
    MessageSquareText,
    ReceiptText,
    Settings,
    Shield,
    Trash2,
    UserCheck,
    UserCog,
    Users,
    Wallet,
} from 'lucide-react';

export interface LibraryNavigationItem {
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
    adminOnly?: boolean;
    requiredRoles?: string[];
    exact?: boolean;
    activePatterns?: RegExp[];
}

export interface LibraryNavigationSection {
    id: string;
    label: string;
    icon: LucideIcon;
    items: LibraryNavigationItem[];
}

export interface LibraryBreadcrumbItem {
    label: string;
    href: string | null;
    isCurrent: boolean;
}

const DASHBOARD_HOME_PATH = '/dashboard';

const hasAdminRole = (roles: string[]) =>
    roles.includes('library_admin') || roles.includes('super_admin');

const hasRequiredRole = (roles: string[], requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    return requiredRoles.some((role) => roles.includes(role));
};

const normalizePath = (currentPath: string) => {
    const basePath = currentPath.split('?')[0]?.split('#')[0] ?? '/';
    const trimmed = basePath.trim();

    if (!trimmed) {
        return '/';
    }

    if (trimmed.length > 1 && trimmed.endsWith('/')) {
        return trimmed.slice(0, -1);
    }

    return trimmed;
};

export const libraryNavigation: LibraryNavigationSection[] = [
    {
        id: 'home',
        label: 'Home',
        icon: Home,
        items: [
            {
                id: 'dashboard-admin',
                label: 'Dashboard',
                href: '/dashboard/library-admin',
                icon: LayoutDashboard,
                adminOnly: true,
                activePatterns: [/^\/dashboard\/library-admin$/],
            },
            {
                id: 'dashboard-staff',
                label: 'Dashboard',
                href: '/dashboard/library-staff',
                icon: LayoutDashboard,
                requiredRoles: ['library_staff'],
                activePatterns: [/^\/dashboard\/library-staff$/],
            },
        ],
    },
    {
        id: 'catalog',
        label: 'Catalog',
        icon: BookOpen,
        items: [
            { id: 'catalog-books', label: 'Books', href: '/books', icon: BookOpen },
            { id: 'catalog-ebooks', label: 'E-books', href: '/ebooks', icon: BookCopy },
            { id: 'catalog-copies', label: 'Copies', href: '/staff/books/copies', icon: Files },
            { id: 'catalog-archived', label: 'Archived', href: '/staff/books/archived', icon: Archive },
            { id: 'catalog-trash', label: 'Trash', href: '/staff/books/trash', icon: Trash2 },
        ],
    },
    {
        id: 'circulation',
        label: 'Circulation',
        icon: ClipboardList,
        items: [
            {
                id: 'circulation-logs',
                label: 'Logs',
                href: '/logs',
                icon: ClipboardList,
                adminOnly: true,
            },
            {
                id: 'circulation-policy',
                label: 'Policy',
                href: '/admin/circulation-policy',
                icon: Settings,
                adminOnly: true,
            },
            {
                id: 'circulation-fines',
                label: 'Fines',
                href: '/admin/fines/outstanding',
                icon: Wallet,
                adminOnly: true,
            },
        ],
    },
    {
        id: 'patrons',
        label: 'Patrons',
        icon: Users,
        items: [
            { id: 'patrons-students', label: 'Students', href: '/students', icon: GraduationCap, adminOnly: true },
            { id: 'patrons-employees', label: 'Employees', href: '/employees', icon: Users, adminOnly: true },
            { id: 'patrons-pending', label: 'Pending', href: '/pending', icon: UserCheck, adminOnly: true },
            {
                id: 'patrons-edit-requests',
                label: 'Edit Requests',
                href: '/student/pending-requests',
                icon: UserCog,
                adminOnly: true,
            },
        ],
    },
    {
        id: 'rooms',
        label: 'Rooms',
        icon: DoorOpen,
        items: [
            { id: 'rooms-pending', label: 'Pending', href: '/rooms/pending', icon: UserCheck, adminOnly: true },
            { id: 'rooms-logs', label: 'Logs', href: '/rooms/logs', icon: ClipboardList, adminOnly: true },
            {
                id: 'rooms-manage',
                label: 'Manage Rooms',
                href: '/rooms',
                icon: Building2,
                adminOnly: true,
                activePatterns: [/^\/rooms$/, /^\/rooms\/create$/, /^\/rooms\/\d+\/edit$/],
            },
        ],
    },
    {
        id: 'reports',
        label: 'Reports',
        icon: FileBarChart2,
        items: [
            { id: 'reports-holdings', label: 'Holdings', href: '/reports/library-holdings', icon: FileBarChart2 },
            { id: 'reports-activity', label: 'Activity', href: '/admin/activities', icon: ReceiptText },
        ],
    },
    {
        id: 'admin',
        label: 'Admin',
        icon: Shield,
        items: [
            { id: 'admin-repository', label: 'Repository', href: '/files', icon: FolderCog, adminOnly: true },
            {
                id: 'admin-marc-frameworks',
                label: 'MARC Frameworks',
                href: '/admin/catalog-frameworks',
                icon: ListTree,
                adminOnly: true,
            },
            {
                id: 'admin-dropdown-options',
                label: 'Dropdown Options',
                href: '/admin/catalog-select-options',
                icon: Settings,
                adminOnly: true,
            },
            {
                id: 'admin-prospectus',
                label: 'Prospectus',
                href: '/prospectus',
                icon: BookOpen,
                adminOnly: true,
            },
            {
                id: 'admin-sms-blast',
                label: 'SMS Blast',
                href: '/sms-blast',
                icon: MessageSquareText,
                adminOnly: true,
            },
        ],
    },
];

export function filterLibraryNavigationByRoles(roles: string[]) {
    const isAdmin = hasAdminRole(roles);

    return libraryNavigation
        .map((section) => {
            const items = section.items.filter((item) => {
                if (item.adminOnly && !isAdmin) {
                    return false;
                }

                return hasRequiredRole(roles, item.requiredRoles);
            });

            if (items.length === 0) {
                return null;
            }

            return {
                ...section,
                items,
            };
        })
        .filter((section): section is LibraryNavigationSection => section !== null);
}

export function isLibraryNavItemActive(currentPath: string, item: LibraryNavigationItem) {
    const normalizedCurrentPath = normalizePath(currentPath);

    if (item.activePatterns?.some((pattern) => pattern.test(normalizedCurrentPath))) {
        return true;
    }

    const normalizedHref = normalizePath(item.href);

    if (item.exact) {
        return normalizedCurrentPath === normalizedHref;
    }

    if (normalizedCurrentPath === normalizedHref) {
        return true;
    }

    if (normalizedHref === '/') {
        return false;
    }

    return normalizedCurrentPath.startsWith(`${normalizedHref}/`);
}

export function resolveLibraryBreadcrumb(currentPath: string): LibraryBreadcrumbItem[] {
    const normalizedCurrentPath = normalizePath(currentPath);

    const activeSection = libraryNavigation.find((section) =>
        section.items.some((item) => isLibraryNavItemActive(normalizedCurrentPath, item)),
    );
    const activeItem = activeSection?.items.find((item) =>
        isLibraryNavItemActive(normalizedCurrentPath, item),
    );

    if (!activeSection || !activeItem) {
        return [{ label: 'Home', href: DASHBOARD_HOME_PATH, isCurrent: true }];
    }

    if (activeSection.id === 'home') {
        return [
            { label: 'Home', href: DASHBOARD_HOME_PATH, isCurrent: false },
            { label: activeItem.label, href: null, isCurrent: true },
        ];
    }

    const sectionHref = activeSection.items[0]?.href ?? null;

    return [
        { label: 'Home', href: DASHBOARD_HOME_PATH, isCurrent: false },
        { label: activeSection.label, href: sectionHref, isCurrent: false },
        { label: activeItem.label, href: null, isCurrent: true },
    ];
}
