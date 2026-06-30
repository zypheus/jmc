import { libraryNavigation } from './libraryNavigation';
import { filterNavigation } from '@/lib/authorization';
import type { PageProps } from '@/types';
import { describe, expect, it } from 'vitest';

function authWithRole(role: 'library_admin' | 'library_staff'): PageProps['auth'] {
    return {
        user: {
            id: 1,
            name: 'Library User',
            fname: 'Library',
            lname: 'User',
            fullName: 'Library User',
            email: 'library@test.test',
            roles: [role],
            permissions: [],
            role,
            isAdmin: role === 'library_admin',
            initials: 'LU',
            avatarUrl: null,
        },
        availableModules: ['library'],
        activeModule: 'library',
        isSuperAdmin: false,
    };
}

function allIds(auth: PageProps['auth']): string[] {
    return filterNavigation(libraryNavigation(auth), auth, 'library')
        .flatMap((group) => group.items.flatMap((item) => [item.id, ...(item.children?.map((child) => child.id) ?? [])]));
}

describe('libraryNavigation', () => {
    it('uses a real role-aware dashboard and exposes admin workflows', () => {
        const auth = authWithRole('library_admin');
        const navigation = filterNavigation(libraryNavigation(auth), auth, 'library');
        const dashboard = navigation[0].items[0];

        expect(dashboard.label).toBe('Dashboard');
        expect(dashboard.routeName).toBe('library.dashboard.admin');
        expect(allIds(auth)).toContain('circulation-desk');
        expect(allIds(auth)).toContain('administration-tools');
    });

    it('hides administrator queues and settings from library staff', () => {
        const auth = authWithRole('library_staff');
        const ids = allIds(auth);

        expect(ids).not.toContain('circulation-desk');
        expect(ids).not.toContain('pending-registrations');
        expect(ids).not.toContain('patrons');
        expect(ids).not.toContain('administration-tools');
        expect(ids).toContain('catalog-collections');
        expect(ids).toContain('opac');
    });
});
