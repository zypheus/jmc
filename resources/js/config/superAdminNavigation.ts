import { ClipboardCheck, LayoutDashboard, Library, UserPlus, Users } from 'lucide-react';

import type { NavigationGroup } from '@/types/navigation';

export const superAdminNavigation: NavigationGroup[] = [
    {
        id: 'super-admin-system',
        label: 'System',
        items: [
            {
                id: 'super-admin-dashboard',
                label: 'Overview',
                icon: LayoutDashboard,
                routeName: 'super-admin.dashboard',
            },
            {
                id: 'super-admin-users',
                label: 'Staff Users',
                icon: Users,
                routeName: 'staff-users.index',
                routePrefixes: ['staff-users.index', 'staff-users.edit'],
            },
            {
                id: 'super-admin-create-user',
                label: 'Create Staff User',
                icon: UserPlus,
                routeName: 'staff-users.create',
            },
        ],
    },
    {
        id: 'super-admin-modules',
        label: 'Module Access',
        items: [
            {
                id: 'super-admin-attendance',
                label: 'Attendance Administration',
                icon: ClipboardCheck,
                routeName: 'attendance.dashboard.admin',
            },
            {
                id: 'super-admin-library',
                label: 'Library Administration',
                icon: Library,
                routeName: 'library.dashboard.admin',
            },
        ],
    },
];
