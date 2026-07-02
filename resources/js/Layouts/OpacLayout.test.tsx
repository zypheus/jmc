import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import OpacLayout from './OpacLayout';

describe('OpacLayout mobile navigation', () => {
    it('toggles OPAC navigation from the burger button and closes on Escape', async () => {
        const user = userEvent.setup();
        render(
            <OpacLayout>
                <h1>OPAC content</h1>
            </OpacLayout>,
        );

        const nav = screen.getByRole('navigation', { name: 'OPAC navigation' });
        expect(nav).toHaveClass('hidden');

        const openButton = screen.getByRole('button', { name: 'Open OPAC navigation' });
        await user.click(openButton);

        expect(nav).toHaveClass('flex');
        expect(screen.getByRole('button', { name: 'Close OPAC navigation' })).toHaveAttribute('aria-expanded', 'true');

        await user.keyboard('{Escape}');

        await waitFor(() => expect(nav).toHaveClass('hidden'));
    });
});
