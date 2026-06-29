import type { AdminNavigationItem } from '@/config/libraryNavigation';

export const superAdminNavigation: AdminNavigationItem[] = [
    {
        label: 'System Overview',
        href: '/dashboard/super-admin',
        routeName: 'super-admin.dashboard',
        icon: 'Home',
    },
    {
        label: 'Staff Accounts',
        href: '/staff-users',
        routePrefix: 'staff-users.',
        icon: 'Shield',
    },
    {
        label: 'Library Module',
        href: '/dashboard/library-admin',
        routePrefix: 'library.',
        icon: 'Library',
    },
    {
        label: 'Attendance Module',
        href: '/dashboard/attendance-admin',
        routePrefix: 'attendance.',
        icon: 'ClipboardCheck',
    },
];
