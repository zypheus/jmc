import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, vi } from 'vitest';

import { cleanup } from '@testing-library/react';

vi.mock('@inertiajs/react', () => ({
    Link: React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
        ({ children, href, ...props }, ref) => <a ref={ref} href={String(href)} {...props}>{children}</a>,
    ),
    router: {
        visit: vi.fn(),
        post: vi.fn(),
    },
}));

const routeMock = ((name?: string) => {
    if (!name) {
        return { has: () => true };
    }

    return `/${name.split('.').join('/')}`;
}) as typeof route;

(globalThis as unknown as { route: typeof route }).route = routeMock;

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.clearAllMocks();
});
