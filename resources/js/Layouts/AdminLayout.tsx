import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

import AdminAppShell from '@/components/layout/AdminAppShell';
import { superAdminNavigation } from '@/config/superAdminNavigation';
import type { PageProps } from '@/types';

export default function AdminLayout({ children }: PropsWithChildren) {
    const { props } = usePage<PageProps>();
    const { auth, flash, routeName, adminActivity } = props;

    return (
        <AdminAppShell
            module="super-admin"
            navigation={superAdminNavigation}
            routeName={routeName}
            auth={auth}
            adminActivity={adminActivity ?? null}
            flash={flash}
        >
            {children}
        </AdminAppShell>
    );
}
