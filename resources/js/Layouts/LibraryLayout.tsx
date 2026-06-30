import { usePage } from '@inertiajs/react';
import { PropsWithChildren, useMemo } from 'react';

import LibraryShell from '@/components/shells/library/LibraryShell';
import { libraryNavigation } from '@/config/libraryNavigation';
import type { PageProps } from '@/types';

export default function LibraryLayout({ children }: PropsWithChildren) {
    const { props } = usePage<PageProps>();
    const { auth, flash, routeName, adminActivity, libraryNavigationStatus } = props;
    const navigation = useMemo(() => libraryNavigation(auth), [auth]);

    return (
        <LibraryShell
            navigation={navigation}
            routeName={routeName}
            auth={auth}
            adminActivity={adminActivity ?? null}
            navigationStatus={libraryNavigationStatus ?? null}
            flash={flash}
        >
            {children}
        </LibraryShell>
    );
}
