import { usePage } from '@inertiajs/react';
import { PropsWithChildren, useMemo } from 'react';

import AttendanceShell from '@/components/shells/attendance/AttendanceShell';
import { attendanceNavigation } from '@/config/attendanceNavigation';
import type { PageProps } from '@/types';

export default function AttendanceLayout({ children }: PropsWithChildren) {
    const { props } = usePage<PageProps>();
    const { auth, flash, routeName } = props;
    const navigation = useMemo(() => attendanceNavigation(auth), [auth]);

    return (
        <AttendanceShell
            navigation={navigation}
            routeName={routeName}
            auth={auth}
            flash={flash}
        >
            {children}
        </AttendanceShell>
    );
}
