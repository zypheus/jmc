import { usePage } from '@inertiajs/react';
import { PropsWithChildren, useMemo } from 'react';

import AdminAppShell from '@/components/layout/AdminAppShell';
import {
    type AdminNavigationItem,
    resolveBreadcrumbs,
} from '@/config/libraryNavigation';
import type { PageProps } from '@/types';

const attendanceNavigation: AdminNavigationItem[] = [
    {
        label: 'Home',
        href: '/dashboard/attendance-admin',
        routeName: 'dashboard.attendance-admin',
        icon: 'Home',
    },
    {
        label: 'Attendance',
        icon: 'ClipboardCheck',
        children: [
            { label: 'Kiosk', href: '/attendance', routeName: 'attendance.scan' },
            { label: 'Pending', href: '/attendance/pending', routeName: 'attendance.pending.index' },
            { label: 'Students', href: '/attendance/students', routeName: 'attendance.students.index' },
            { label: 'Employees', href: '/attendance/employees', routeName: 'attendance.employees.index' },
            { label: 'Logs', href: '/attendance/logs', routeName: 'attendance.logs.index', adminOnly: true },
            { label: 'Reports', href: '/attendance/logs/reports', routeName: 'attendance.logs.reports.hub', adminOnly: true },
            { label: 'Gate Feedback', href: '/attendance/feedbacks', routeName: 'attendance.feedback.index', adminOnly: true },
            { label: 'Settings', href: '/attendance/section-picker', routeName: 'attendance.section.settings' },
            { label: 'SMS Blast', href: '/attendance/sms-blast', routeName: 'attendance.sms.page' },
        ],
    },
];

export default function AttendanceLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage<PageProps>();
    const { auth, flash, routeName, adminActivity } = props;
    const currentPath = url.split('?')[0];
    const isAdmin = auth.user?.isAdmin ?? false;
    const navigation = useMemo(
        () => attendanceNavigation
            .map((item) => {
                if (!item.children?.length) {
                    return item;
                }

                const children = item.children.filter((child) => !child.adminOnly || isAdmin);
                return {
                    ...item,
                    children,
                };
            })
            .filter((item) => {
                if (item.adminOnly && !isAdmin) {
                    return false;
                }

                if (item.children) {
                    return item.children.length > 0;
                }

                return true;
            }),
        [isAdmin],
    );
    const breadcrumbs = resolveBreadcrumbs(navigation, routeName, currentPath);

    return (
        <AdminAppShell
            navigation={navigation}
            currentPath={currentPath}
            routeName={routeName}
            breadcrumbs={breadcrumbs}
            auth={auth}
            adminActivity={adminActivity ?? null}
            flash={flash}
        >
            {children}
        </AdminAppShell>
    );
}
