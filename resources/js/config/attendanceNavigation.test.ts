import { describe, expect, it } from 'vitest';

import { attendanceNavigation } from './attendanceNavigation';
import { filterNavigation } from '@/lib/authorization';
import type { PageProps } from '@/types';

function authWithRole(role: 'attendance_admin' | 'attendance_staff'): PageProps['auth'] {
    return {
        user: {
            id: 1,
            name: 'Attendance User',
            fname: 'Attendance',
            lname: 'User',
            fullName: 'Attendance User',
            email: 'attendance@test.test',
            roles: [role],
            permissions: [],
            role,
            isAdmin: role === 'attendance_admin',
            initials: 'AU',
            avatarUrl: null,
        },
        availableModules: ['attendance'],
        activeModule: 'attendance',
        isSuperAdmin: false,
    };
}

function allIds(auth: PageProps['auth']): string[] {
    return filterNavigation(attendanceNavigation(auth), auth, 'attendance')
        .flatMap((group) => group.items.flatMap((item) => [item.id, ...(item.children?.map((child) => child.id) ?? [])]));
}

describe('attendanceNavigation', () => {
    it('exposes attendance management and reporting to attendance administrators', () => {
        const ids = allIds(authWithRole('attendance_admin'));

        expect(ids).toContain('manage-video');
        expect(ids).toContain('logout-feedback');
        expect(ids).toContain('attendance-feedback-report');
    });

    it('hides attendance administrator features from attendance staff', () => {
        const ids = allIds(authWithRole('attendance_staff'));

        expect(ids).not.toContain('manage-video');
        expect(ids).not.toContain('logout-feedback');
        expect(ids).not.toContain('attendance-feedback-report');
    });
});
