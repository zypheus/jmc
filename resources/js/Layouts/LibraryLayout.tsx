import { usePage } from '@inertiajs/react';
import { PropsWithChildren, useMemo } from 'react';

import AdminAppShell from '@/components/layout/AdminAppShell';
import {
    adminNavigation,
    filterNavigation,
    resolveBreadcrumbs,
} from '@/config/libraryNavigation';
import type { PageProps } from '@/types';

export default function LibraryLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage<PageProps>();
    const { auth, flash, routeName, adminActivity } = props;
    const currentPath = url.split('?')[0];
    const isAdmin = auth.user?.isAdmin ?? false;

    const navigation = useMemo(() => filterNavigation(adminNavigation, isAdmin), [isAdmin]);
    const breadcrumbs = useMemo(
        () => resolveBreadcrumbs(navigation, routeName, currentPath),
        [navigation, routeName, currentPath],
    );

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
