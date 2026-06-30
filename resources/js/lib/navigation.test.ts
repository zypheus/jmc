import { Circle } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { isNavigationItemActive, resolveBreadcrumbs } from './navigation';
import type { PageProps } from '@/types';
import type { NavigationGroup } from '@/types/navigation';

const auth: PageProps['auth'] = {
    user: null,
    availableModules: ['library'],
    activeModule: 'library',
    isSuperAdmin: false,
};

describe('resolveBreadcrumbs', () => {
    it('does not create a hash link for a branch without a destination', () => {
        const groups: NavigationGroup[] = [{
            id: 'manage',
            label: 'Manage',
            items: [{
                id: 'catalog',
                label: 'Catalog & collections',
                icon: Circle,
                children: [{
                    id: 'books',
                    label: 'Books',
                    icon: Circle,
                    routeName: 'library.books.index',
                }],
            }],
        }];

        const breadcrumbs = resolveBreadcrumbs(groups, 'library', auth, 'library.books.index');

        expect(breadcrumbs[1]).toEqual({ label: 'Catalog & collections', href: undefined });
        expect(breadcrumbs[2]).toEqual({ label: 'Books', current: true });
    });
});

describe('isNavigationItemActive', () => {
    it('lets specific destinations opt out of broad resource prefixes', () => {
        const books = {
            id: 'books',
            label: 'Books',
            icon: Circle,
            routeName: 'library.books.index',
            routePrefixes: ['library.books.'],
            routeExclusions: ['library.books.archived', 'library.books.trash'],
        };

        expect(isNavigationItemActive(books, 'library.books.index')).toBe(true);
        expect(isNavigationItemActive(books, 'library.books.archived')).toBe(false);
    });
});
