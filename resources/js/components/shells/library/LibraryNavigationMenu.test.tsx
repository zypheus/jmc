import { Circle, Folder } from 'lucide-react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import LibraryNavigationMenu, { formatNavigationBadge } from './LibraryNavigationMenu';
import type { NavigationGroup } from '@/types/navigation';

const groups: NavigationGroup[] = [
    {
        id: 'workspace',
        label: 'Workspace',
        items: [
            {
                id: 'pending',
                label: 'Pending registrations',
                icon: Circle,
                routeName: 'library.pending.index',
                badgeKey: 'pendingPatrons',
                badgeTone: 'warning',
            },
        ],
    },
    {
        id: 'manage',
        label: 'Manage',
        items: [
            {
                id: 'catalog',
                label: 'Catalog & collections',
                icon: Folder,
                children: [
                    { id: 'books', label: 'Books', icon: Circle, routeName: 'library.books.index' },
                    { id: 'ebooks', label: 'E-books', icon: Circle, routeName: 'library.ebooks.index' },
                ],
            },
        ],
    },
];

describe('LibraryNavigationMenu', () => {
    it('renders meaningful groups, badges, and persisted expandable branches', async () => {
        const user = userEvent.setup();
        render(
            <LibraryNavigationMenu
                groups={groups}
                routeName="library.pending.index"
                collapsed={false}
                counts={{ pendingPatrons: 120, pendingRooms: 0, outstandingFines: 0 }}
            />,
        );

        expect(screen.getByRole('heading', { name: 'Workspace' })).toBeInTheDocument();
        expect(screen.getByText('99+')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Books' })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Catalog & collections' }));
        expect(screen.getByRole('link', { name: 'Books' })).toBeInTheDocument();
        await waitFor(() => expect(window.localStorage.getItem('jmc.library.sidebar.open-sections')).toContain('catalog'));
    });

    it('exposes every branch destination from the collapsed flyout', async () => {
        const user = userEvent.setup();
        render(<LibraryNavigationMenu groups={groups} collapsed routeName={null} />);

        await user.click(screen.getByRole('button', { name: 'Catalog & collections' }));

        expect(await screen.findByRole('link', { name: 'Books' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'E-books' })).toBeInTheDocument();
    });

    it('keeps the active branch visible', async () => {
        const user = userEvent.setup();
        render(<LibraryNavigationMenu groups={groups} collapsed={false} routeName="library.books.index" />);

        const branch = screen.getByRole('button', { name: 'Catalog & collections' });
        expect(screen.getByRole('link', { name: 'Books' })).toBeInTheDocument();
        await user.click(branch);
        expect(screen.getByRole('link', { name: 'Books' })).toBeInTheDocument();
    });

    it('formats large badge values without hiding their urgency', () => {
        expect(formatNavigationBadge(0)).toBe('0');
        expect(formatNavigationBadge(99)).toBe('99');
        expect(formatNavigationBadge(100)).toBe('99+');
    });
});
