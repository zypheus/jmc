import { Circle } from 'lucide-react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import LibraryShell from './LibraryShell';
import type { PageProps } from '@/types';
import type { NavigationGroup } from '@/types/navigation';

const auth: PageProps['auth'] = {
    user: {
        id: 1,
        name: 'Library Admin',
        fname: 'Library',
        lname: 'Admin',
        fullName: 'Library Admin',
        email: 'library@test.test',
        roles: ['library_admin'],
        permissions: [],
        role: 'library_admin',
        isAdmin: true,
        initials: 'LA',
        avatarUrl: null,
    },
    availableModules: ['library'],
    activeModule: 'library',
    isSuperAdmin: false,
};

const navigation: NavigationGroup[] = [{
    id: 'workspace',
    label: 'Workspace',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: Circle, routeName: 'library.dashboard.admin' }],
}];

describe('LibraryShell mobile navigation', () => {
    it('traps the drawer as a dialog and returns focus after Escape', async () => {
        const user = userEvent.setup();
        render(
            <LibraryShell navigation={navigation} routeName="library.dashboard.admin" auth={auth} flash={{}}>
                <h1>Page content</h1>
            </LibraryShell>,
        );

        const openButton = screen.getByRole('button', { name: 'Open navigation' });
        await user.click(openButton);
        expect(screen.getByRole('dialog', { name: 'Library navigation' })).toBeInTheDocument();

        await user.keyboard('{Escape}');
        await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Library navigation' })).not.toBeInTheDocument());
        expect(openButton).toHaveFocus();
    });

    it('opens mobile navigation with visible text labels instead of collapsed icon-only items', async () => {
        const user = userEvent.setup();
        render(
            <LibraryShell navigation={navigation} routeName="library.dashboard.admin" auth={auth} flash={{}}>
                <h1>Page content</h1>
            </LibraryShell>,
        );

        await user.click(screen.getByRole('button', { name: 'Open navigation' }));

        const dialog = screen.getByRole('dialog', { name: 'Library navigation' });
        expect(dialog).toHaveTextContent('PANTAS');
        expect(dialog).toHaveTextContent('Dashboard');
        expect(dialog.querySelector('.library-nav-link.is-collapsed')).not.toBeInTheDocument();
    });
});
