import { BookOpen, Globe } from 'lucide-react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LibraryNavigationCommand from './LibraryNavigationCommand';
import type { NavigationGroup } from '@/types/navigation';

const groups: NavigationGroup[] = [
    {
        id: 'manage',
        label: 'Manage',
        items: [
            {
                id: 'catalog',
                label: 'Catalog & collections',
                icon: BookOpen,
                children: [
                    {
                        id: 'copy-cataloging',
                        label: 'Copy cataloging',
                        icon: BookOpen,
                        routeName: 'library.catalog.copy.openlibrary.form',
                        keywords: ['isbn'],
                    },
                ],
            },
        ],
    },
    {
        id: 'public',
        label: 'Public tools',
        items: [
            {
                id: 'opac',
                label: 'OPAC',
                icon: Globe,
                routeName: 'library.landing',
                navigationMode: 'new-tab',
            },
        ],
    },
];

describe('LibraryNavigationCommand', () => {
    it('searches authorized destinations by keywords', async () => {
        const user = userEvent.setup();
        render(<LibraryNavigationCommand groups={groups} open onOpenChange={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('Search library navigation…'), 'isbn');

        expect(screen.getByText('Copy cataloging')).toBeInTheDocument();
        expect(screen.queryByText('OPAC')).not.toBeInTheDocument();
    });

    it('opens public tools in a new tab', async () => {
        const user = userEvent.setup();
        const openWindow = vi.spyOn(window, 'open').mockImplementation(() => null);
        render(<LibraryNavigationCommand groups={groups} open onOpenChange={vi.fn()} />);

        await user.click(screen.getByText('OPAC'));

        expect(openWindow).toHaveBeenCalledWith('/library/landing', '_blank', 'noopener,noreferrer');
    });

    it('supports the global command shortcut', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        render(<LibraryNavigationCommand groups={groups} open={false} onOpenChange={onOpenChange} />);

        await user.keyboard('{Control>}k{/Control}');

        expect(onOpenChange).toHaveBeenCalledWith(true);
    });
});
