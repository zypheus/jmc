import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Index from '@/Pages/Auth/StaffUsers/Index';
import type { PageProps, StaffUser } from '@/types';

const { patch } = vi.hoisted(() => ({ patch: vi.fn() }));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
    router: { patch },
}));

vi.mock('@/Layouts/AdminLayout', () => ({ default: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('@/Layouts/AttendanceLayout', () => ({ default: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('@/Layouts/LibraryLayout', () => ({ default: ({ children }: { children: React.ReactNode }) => children }));

const activeUser: StaffUser = {
    id: 2,
    fname: 'Jamie',
    lname: 'Cruz',
    fullName: 'Jamie Cruz',
    email: 'jamie@jmc.test',
    roles: ['library_staff'],
    isActive: true,
};

const auth = {
    user: {
        id: 1,
        roles: ['library_admin'],
    },
} as PageProps['auth'];

describe('StaffUsers Index', () => {
    it('requires confirmation before deactivating a staff user', async () => {
        const user = userEvent.setup();
        render(
            <Index
                users={{
                    data: [activeUser],
                    current_page: 1,
                    last_page: 1,
                    per_page: 20,
                    total: 1,
                    links: [],
                }}
                manageableRoles={['library_staff']}
                actingRole="library_admin"
                auth={auth}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Deactivate' }));

        expect(patch).not.toHaveBeenCalled();
        expect(screen.getByRole('alertdialog', { name: 'Deactivate Jamie Cruz?' })).toBeInTheDocument();
        expect(screen.getByText(/no longer be able to sign in/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Deactivate user' }));

        expect(patch).toHaveBeenCalledWith(
            '/staff-users/2/status',
            { is_active: false },
            expect.objectContaining({ preserveScroll: true }),
        );
    });
});
