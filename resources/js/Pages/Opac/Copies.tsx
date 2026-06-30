import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Bookmark, ChevronLeft, ShoppingBag, ShoppingCart, X } from 'lucide-react';

import PaginationLinks from '@/components/PaginationLinks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OpacLayout from '@/Layouts/OpacLayout';
import type { Paginated } from '@/types';

import OpacCartDialog from './OpacCartDialog';
import PatronActionDialog, { type CheckoutResponse } from './PatronActionDialog';
import { printCheckoutReceipt } from './receipt';
import type { CartItem, OpacCopy } from './types';
import { useOpacCart } from './useOpacCart';

interface CopiesProps {
    copies: Paginated<OpacCopy>;
    title: string;
    author: string;
    year: string | number;
}

export default function Copies({ copies, title, author, year }: CopiesProps) {
    const cart = useOpacCart();
    const [cartOpen, setCartOpen] = useState(false);
    const [action, setAction] = useState<{ mode: 'reserve' | 'checkout'; items: CartItem[] } | null>(null);
    const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(null), 5000);
        return () => window.clearTimeout(timer);
    }, [notice]);

    function item(copy: OpacCopy): CartItem {
        return { id: copy.id, title, author: author || '' };
    }

    function add(copy: OpacCopy) {
        const result = cart.add(item(copy));
        setNotice({ message: result.message, tone: result.ok ? 'success' : 'error' });
    }

    async function actionSucceeded(data: CheckoutResponse | { success: true; message: string }) {
        if ('books' in data) {
            data.books.forEach((book) => cart.remove(book.id));
            setNotice({ message: 'Checkout completed successfully.', tone: 'success' });
            try {
                await printCheckoutReceipt(data.patron, data.books);
            } catch {
                setNotice({ message: 'Checkout succeeded, but the receipt could not print. Check QZ Tray and GLPrint.', tone: 'error' });
            }
        } else {
            setNotice({ message: data.message, tone: 'success' });
        }
        setCartOpen(false);
        router.reload({ only: ['copies'] });
    }

    function actions(copy: OpacCopy) {
        if (copy.reserved) return <span className="text-xs text-muted-foreground">Room use only</span>;
        if (copy.availability === 'On Hold' && copy.patron_hold_status === 'ready') {
            return <Button size="sm" onClick={() => setAction({ mode: 'checkout', items: [item(copy)] })}>Self-checkout</Button>;
        }
        if (copy.patron_hold) return <span className="text-xs font-medium text-amber-700">Reserved</span>;

        return (
            <div className="flex flex-wrap gap-2">
                {copy.availability === 'Available' && <Button size="sm" onClick={() => add(copy)}><ShoppingCart className="size-3.5" /> Add</Button>}
                {(copy.availability === 'Available' || copy.availability === 'Borrowed') && <Button size="sm" variant="outline" onClick={() => setAction({ mode: 'reserve', items: [item(copy)] })}><Bookmark className="size-3.5" /> Reserve</Button>}
            </div>
        );
    }

    return (
        <OpacLayout>
            <Head title={`Copies of ${title}`} />

            {notice && (
                <div role="status" className={`fixed right-4 top-4 z-[80] max-w-md rounded-xl border px-4 py-3 text-sm shadow-xl ${notice.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
                    <div className="flex gap-3"><span className="flex-1">{notice.message}</span><button onClick={() => setNotice(null)} aria-label="Dismiss"><X className="size-4" /></button></div>
                </div>
            )}

            <div className="space-y-6">
                <Button asChild variant="outline"><Link href="/opac"><ChevronLeft className="size-4" /> Back to OPAC</Link></Button>
                <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--jmc-green)]">Grouped holdings</p><h1 className="mt-2 font-display text-3xl font-semibold">{title}</h1><p className="mt-1 text-muted-foreground">{author || 'Unknown author'}{year ? ` · ${year}` : ''}</p><p className="mt-3 text-sm text-muted-foreground">Choose a specific copy. Your borrow cart remains available as you return to the catalog.</p></div>

                <div className="grid gap-3">
                    {copies.data.map((copy) => (
                        <Card key={copy.id}><CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-center"><div><p className="font-medium">Accession {copy.accession_no || '—'}</p><p className="text-sm text-muted-foreground">Call no. {copy.call_number || '—'} · {copy.shelving_location || 'Location not set'}</p></div><div className="flex flex-wrap gap-2"><Badge variant={copy.availability === 'Available' ? 'default' : 'secondary'}>{copy.patron_hold ? (copy.patron_hold_status === 'pending' ? 'Reserved · waiting' : 'On hold') : copy.circulation_status}</Badge>{copy.barcode && <Badge variant="outline">{copy.barcode}</Badge>}{copy.rfid && <Badge variant="outline">RFID {copy.rfid}</Badge>}</div><div>{actions(copy)}</div></CardContent></Card>
                    ))}
                    {copies.data.length === 0 && <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">No copies match this grouped title.</div>}
                </div>
                <PaginationLinks links={copies.links} />
            </div>

            <Button type="button" onClick={() => setCartOpen(true)} className="fixed bottom-6 right-6 z-40 h-12 rounded-full px-5 shadow-xl"><ShoppingBag className="size-5" /> Cart <Badge variant="secondary">{cart.items.length}</Badge></Button>
            <OpacCartDialog items={cart.items} open={cartOpen} onOpenChange={setCartOpen} onRemove={cart.remove} onCheckout={() => setAction({ mode: 'checkout', items: cart.items })} />
            <PatronActionDialog mode={action?.mode ?? 'checkout'} items={action?.items ?? []} open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)} onSuccess={actionSucceeded} />
        </OpacLayout>
    );
}
