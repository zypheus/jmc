import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useScannerInput } from './use-scanner-input';

function scan(value: string) {
    for (const key of value) document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
}

describe('useScannerInput', () => {
    afterEach(() => vi.useRealTimers());

    it('buffers scanner keystrokes and submits on Enter', () => {
        const onScan = vi.fn();
        renderHook(() => useScannerInput({ enabled: true, onScan }));

        act(() => scan('AS-00000001'));

        expect(onScan).toHaveBeenCalledWith('AS-00000001');
    });

    it('does not capture while disabled or inside editable controls', () => {
        const onScan = vi.fn();
        const { rerender } = renderHook(({ enabled }) => useScannerInput({ enabled, onScan }), {
            initialProps: { enabled: false },
        });

        act(() => scan('DISABLED'));
        rerender({ enabled: true });

        const input = document.createElement('input');
        document.body.appendChild(input);
        act(() => {
            for (const key of 'MANUAL') input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        });

        expect(onScan).not.toHaveBeenCalled();
        input.remove();
    });

    it('clears an incomplete scan after the idle timeout', () => {
        vi.useFakeTimers();
        const onScan = vi.fn();
        renderHook(() => useScannerInput({ enabled: true, idleTimeout: 100, onScan }));

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', bubbles: true }));
            vi.advanceTimersByTime(101);
            scan('B');
        });

        expect(onScan).toHaveBeenCalledWith('B');
    });
});
