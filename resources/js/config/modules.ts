import { ClipboardCheck, Library, ShieldCheck, type LucideIcon } from 'lucide-react';

import type { PageProps } from '@/types';
import type { AppModule } from '@/types/navigation';

interface ModuleDefinition {
    label: string;
    shortLabel: string;
    icon: LucideIcon;
    dashboardRoute: (auth: PageProps['auth']) => string;
}

export const moduleDefinitions: Record<AppModule, ModuleDefinition> = {
    attendance: {
        label: 'Attendance',
        shortLabel: 'Attendance',
        icon: ClipboardCheck,
        dashboardRoute: (auth) => auth.isSuperAdmin || auth.user?.roles.includes('attendance_admin')
            ? 'attendance.dashboard.admin'
            : 'attendance.dashboard.staff',
    },
    library: {
        label: 'Library',
        shortLabel: 'Library',
        icon: Library,
        dashboardRoute: (auth) => auth.isSuperAdmin || auth.user?.roles.includes('library_admin')
            ? 'library.dashboard.admin'
            : 'library.dashboard.staff',
    },
    'super-admin': {
        label: 'Super Administrator',
        shortLabel: 'Super Admin',
        icon: ShieldCheck,
        dashboardRoute: () => 'super-admin.dashboard',
    },
};

export function dashboardRouteFor(module: AppModule, auth: PageProps['auth']): string {
    return moduleDefinitions[module].dashboardRoute(auth);
}
