import type { CartItem } from './types';

interface CheckoutBook extends CartItem {
    barcode?: string | null;
    due_date?: string | null;
}

interface CheckoutPatron {
    name: string;
    identifier: string | null;
}

interface QzApi {
    websocket: { isActive(): boolean; connect(): Promise<void> };
    configs: { create(name: string): unknown };
    print(config: unknown, data: unknown[]): Promise<void>;
}

declare global {
    interface Window {
        qz?: QzApi;
    }
}

let qzLoader: Promise<QzApi> | null = null;

function loadQz(): Promise<QzApi> {
    if (window.qz) {
        return Promise.resolve(window.qz);
    }

    if (qzLoader) {
        return qzLoader;
    }

    qzLoader = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/vendor/qz-tray/qz-tray.js';
        script.async = true;
        script.onload = () => (window.qz ? resolve(window.qz) : reject(new Error('QZ Tray did not load.')));
        script.onerror = () => reject(new Error('QZ Tray did not load.'));
        document.head.appendChild(script);
    });

    return qzLoader;
}

export async function printCheckoutReceipt(patron: CheckoutPatron, books: CheckoutBook[]): Promise<void> {
    const qz = await loadQz();
    if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
    }

    const lines = books
        .map(
            (book) =>
                `${book.title}\n${book.author || ''}\nBarcode: ${book.barcode || '—'}\nDue date: ${book.due_date || '—'}\n--------------------------------\n`,
        )
        .join('');

    const now = new Date();
    const receipt = [
        '\x1B\x40',
        '\x1B\x61\x00',
        'Jose Maria College Library\n',
        `${now.toLocaleDateString('en-PH')} ${now.toLocaleTimeString('en-PH')}\n\n`,
        `${patron.name.toUpperCase()}\n`,
        `${patron.identifier ?? ''}\n\n`,
        "Today's checkouts\n",
        '--------------------------------\n',
        lines,
        'Served by: ______________________\n\n\n',
        '\x1D\x56\x01',
    ].join('');

    await qz.print(qz.configs.create('GLPrint'), [{ type: 'raw', format: 'command', data: receipt }]);
}
