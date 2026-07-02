import { useEffect, useRef } from 'react';

interface ScannerInputOptions {
    enabled: boolean;
    idleTimeout?: number;
    onScan: (value: string) => void | Promise<void>;
}

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;

    return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

export function useScannerInput({ enabled, idleTimeout = 300, onScan }: ScannerInputOptions) {
    const bufferRef = useRef('');
    const timerRef = useRef<number | null>(null);
    const onScanRef = useRef(onScan);

    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        if (!enabled) {
            bufferRef.current = '';
            return;
        }

        const clearBuffer = () => {
            bufferRef.current = '';
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
            timerRef.current = null;
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey || event.altKey || isEditableTarget(event.target)) return;

            if (event.key === 'Enter') {
                const value = bufferRef.current.trim().replace(/\r/g, '');
                clearBuffer();
                if (!value) return;
                event.preventDefault();
                void onScanRef.current(value);
                return;
            }

            if (event.key.length !== 1) return;

            bufferRef.current += event.key;
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(clearBuffer, idleTimeout);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            clearBuffer();
        };
    }, [enabled, idleTimeout]);
}

