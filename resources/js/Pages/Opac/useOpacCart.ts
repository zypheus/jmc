import { useCallback, useEffect, useState } from 'react';

import type { CartItem } from './types';

const STORAGE_KEY = 'borrowCart';
export const MAX_CART_ITEMS = 5;

function readCart(): CartItem[] {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
        if (!Array.isArray(stored)) {
            return [];
        }

        return stored
            .filter((item) => Number.isInteger(Number(item?.id)) && typeof item?.title === 'string')
            .slice(0, MAX_CART_ITEMS)
            .map((item) => ({
                id: Number(item.id),
                title: item.title,
                author: typeof item.author === 'string' ? item.author : '',
            }));
    } catch {
        return [];
    }
}

export function useOpacCart() {
    const [items, setItems] = useState<CartItem[]>(readCart);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const add = useCallback((item: CartItem): { ok: boolean; message: string } => {
        if (items.some((existing) => existing.id === item.id)) {
            return { ok: false, message: 'This copy is already in your cart.' };
        }
        if (items.length >= MAX_CART_ITEMS) {
            return { ok: false, message: `Your cart can hold up to ${MAX_CART_ITEMS} books.` };
        }

        setItems((current) => [...current, item]);
        return { ok: true, message: 'Added to your borrow cart.' };
    }, [items]);

    const remove = useCallback((id: number) => {
        setItems((current) => current.filter((item) => item.id !== id));
    }, []);

    const clear = useCallback(() => setItems([]), []);

    return { items, add, remove, clear };
}
