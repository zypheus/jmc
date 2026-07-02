import { render, screen, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import { FormErrorSummary, FormField } from './form-field';
import { Input } from './input';

describe('FormField', () => {
    it('associates labels, required state, descriptions, and errors', async () => {
        const { container } = render(
            <form>
                <FormField id="email" label="Email" description="Use your JMC address." error="Email is required." required>
                    {(props) => <Input {...props} type="email" />}
                </FormField>
            </form>,
        );

        const input = screen.getByRole('textbox', { name: /Email/i });
        expect(input).toBeRequired();
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAccessibleDescription('Use your JMC address. Email is required.');
        expect((await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })).violations).toHaveLength(0);
    }, 15000);

    it('focuses the first invalid control when an error summary appears', async () => {
        const { rerender } = render(
            <form>
                <FormField id="name" label="Name">{(props) => <Input {...props} />}</FormField>
            </form>,
        );
        rerender(
            <form>
                <FormErrorSummary errors={{ name: 'Name is required.' }} />
                <FormField id="name" label="Name" error="Name is required.">{(props) => <Input {...props} />}</FormField>
            </form>,
        );

        await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus());
    });
});
