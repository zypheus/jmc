import { ShoppingBag, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { MAX_CART_ITEMS } from './useOpacCart';
import type { CartItem } from './types';

interface OpacCartDialogProps {
    items: CartItem[];
    open: boolean;
    onOpenChange(open: boolean): void;
    onRemove(id: number): void;
    onCheckout(): void;
}

export default function OpacCartDialog({ items, open, onOpenChange, onRemove, onCheckout }: OpacCartDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingBag className="size-5" /> Borrow cart
                    </DialogTitle>
                    <DialogDescription>
                        Select up to {MAX_CART_ITEMS} available copies, then check them out together.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                    {items.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Your cart is empty. Open a catalog record to choose a copy.
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border p-3">
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{item.title}</p>
                                    <p className="truncate text-sm text-muted-foreground">{item.author || 'Unknown author'}</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.title}`}>
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Continue browsing</Button>
                    <Button disabled={items.length === 0} onClick={onCheckout}>Check out {items.length || ''} {items.length === 1 ? 'book' : 'books'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
