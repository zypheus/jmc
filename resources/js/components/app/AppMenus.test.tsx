import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import NotificationMenu from './NotificationMenu';
import ModuleSwitcher from './ModuleSwitcher';
import UserMenu from './UserMenu';
import type { PageProps } from '@/types';

const auth: PageProps['auth'] = {
    user: {
        id: 1,
        name: 'Library Admin',
        fname: 'Library',
        lname: 'Admin',
        fullName: 'Library Admin',
        email: 'admin@jmc.test',
        roles: ['library_admin'],
        permissions: [],
        role: 'library_admin',
        isAdmin: true,
        initials: 'LA',
        avatarUrl: null,
    },
    availableModules: ['attendance', 'library'],
    activeModule: 'library',
    isSuperAdmin: false,
};

describe('application menus', () => {
    it('supports keyboard navigation and restores focus in the user menu', async () => {
        const user = userEvent.setup();
        const onLogout = vi.fn();
        render(<UserMenu auth={auth} onLogout={onLogout} />);
        const trigger = screen.getByRole('button', { name: 'Open user menu' });

        await user.click(trigger);
        const logout = await screen.findByRole('menuitem', { name: /Logout/i });
        await user.click(logout);
        expect(onLogout).toHaveBeenCalledOnce();
        await waitFor(() => expect(trigger).toHaveFocus());
    });

    it('marks notifications seen when opened and closes with Escape', async () => {
        const user = userEvent.setup();
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
        render(<NotificationMenu payload={{
            unreadCount: 1,
            activities: [{ id: 1, title: 'New registration', body: null, action_url: '/pending', created_at: 'Now', is_unread: true }],
            urls: { markSeen: '/notifications/seen' },
        }} />);
        const trigger = screen.getByRole('button', { name: /Notifications, 1 unread/i });

        await user.click(trigger);
        expect(await screen.findByRole('menuitem', { name: /New registration/i })).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledWith('/notifications/seen', expect.objectContaining({ method: 'POST' }));
        await user.keyboard('{Escape}');

        await waitFor(() => expect(screen.queryByRole('menuitem', { name: /New registration/i })).not.toBeInTheDocument());
        expect(trigger).toHaveFocus();
    });

    it('opens module switching as a dialog with role-appropriate options', async () => {
        const user = userEvent.setup();
        render(<ModuleSwitcher auth={auth} module="library" />);

        await user.click(screen.getByRole('button', { name: /Library/i }));

        expect(await screen.findByRole('dialog', { name: 'Switch workspace' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Attendance/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Library/i })).toBeDisabled();
        expect(screen.queryByRole('button', { name: /Super Administrator/i })).not.toBeInTheDocument();
    });

    it('shows all three workspaces to super administrators', async () => {
        const user = userEvent.setup();
        const superAuth: PageProps['auth'] = {
            ...auth,
            isSuperAdmin: true,
            activeModule: 'super-admin',
            user: auth.user ? { ...auth.user, roles: ['super_admin'] } : null,
        };
        render(<ModuleSwitcher auth={superAuth} module="super-admin" />);

        await user.click(screen.getByRole('button', { name: /Super Admin/i }));

        expect(await screen.findByRole('button', { name: /Attendance/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Library/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Super Administrator/i })).toBeDisabled();
    });
});
