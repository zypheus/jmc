import { usePage } from '@inertiajs/react';
import { PropsWithChildren, useMemo } from 'react';

import AdminAppShell from '@/components/layout/AdminAppShell';
import { attendanceNavigation } from '@/config/attendanceNavigation';
import {
    resolveBreadcrumbs,
} from '@/config/libraryNavigation';
import type { PageProps } from '@/types';

export default function AttendanceLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage<PageProps>();
    const { auth, flash, routeName, adminActivity } = props;
    const currentPath = url.split('?')[0];
    const isAdmin = auth.isSuperAdmin || auth.user?.roles.includes('attendance_admin') === true;
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
