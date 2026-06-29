import { usePage } from '@inertiajs/react';
import { PropsWithChildren, useMemo } from 'react';

import AdminAppShell from '@/components/layout/AdminAppShell';
import { resolveBreadcrumbs } from '@/config/libraryNavigation';
import { superAdminNavigation } from '@/config/superAdminNavigation';
import type { PageProps } from '@/types';

export default function AdminLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage<PageProps>();
    const { auth, flash, routeName, adminActivity } = props;
    const currentPath = url.split('?')[0];
    const breadcrumbs = useMemo(
        () => resolveBreadcrumbs(superAdminNavigation, routeName, currentPath),
        [routeName, currentPath],
    );

    return (
        <AdminAppShell
            navigation={superAdminNavigation}
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
