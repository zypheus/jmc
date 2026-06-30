import { FormEvent, useEffect, useState } from 'react';
import { Bookmark, LoaderCircle, ScanLine, ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { postJson } from './api';
import type { CartItem } from './types';

export interface CheckoutResponse {
    success: true;
    patron: {
        type: 'student' | 'employee';
        name: string;
        identifier: string | null;
        course: string | null;
        department: string | null;
    };
    books: Array<CartItem & { barcode: string | null; due_date: string | null }>;
    due_date: string | null;
}

interface PatronActionDialogProps {
    mode: 'reserve' | 'checkout';
    open: boolean;
    items: CartItem[];
    onOpenChange(open: boolean): void;
    onSuccess(data: CheckoutResponse | { success: true; message: string }): Promise<void> | void;
}

export default function PatronActionDialog({ mode, open, items, onOpenChange, onSuccess }: PatronActionDialogProps) {
    const [token, setToken] = useState('');
    const [loanMode, setLoanMode] = useState<'default' | 'custom'>('default');
    const [days, setDays] = useState(7);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setToken('');
            setLoanMode('default');
            setDays(7);
            setError('');
        }
    }, [open, mode]);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token.trim()) {
            setError('Enter your student ID, employee ID, or QR code.');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            if (mode === 'reserve') {
                const data = await postJson<{ success: true; message: string }>('/opac/reserve', {
                    patron_token: token.trim(),
                    book_id: items[0]?.id,
                });
                await onSuccess(data);
            } else {
                const payload: Record<string, unknown> = {
                    patron_token: token.trim(),
                    books: items.map((item) => ({ id: item.id })),
                };
                if (loanMode === 'custom') {
                    payload.loan_duration_days = days;
                }

                const data = await postJson<CheckoutResponse>('/checkout/process', payload);
                await onSuccess(data);
            }
            onOpenChange(false);
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'The request could not be completed.');
        } finally {
            setProcessing(false);
        }
    }

    const isReserve = mode === 'reserve';

    return (
        <Dialog open={open} onOpenChange={(next) => !processing && onOpenChange(next)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isReserve ? <Bookmark className="size-5" /> : <ShoppingBag className="size-5" />}
                        {isReserve ? 'Reserve this copy' : 'Self-checkout'}
                    </DialogTitle>
                    <DialogDescription>
                        {isReserve
                            ? 'Available copies are held for pickup; borrowed copies enter the reservation queue.'
                            : `Check out ${items.length} ${items.length === 1 ? 'copy' : 'copies'} using your approved library record.`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="opac-patron-token">Student ID, employee ID, or QR code</Label>
                        <div className="relative">
                            <ScanLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="opac-patron-token"
                                value={token}
                                onChange={(event) => setToken(event.target.value)}
                                className="pl-9"
                                autoComplete="off"
                                autoFocus
                                placeholder="Scan or enter your ID"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Only approved JMC library patrons can continue.</p>
                    </div>

                    {!isReserve && (
                        <fieldset className="space-y-3 rounded-xl border p-4">
                            <legend className="px-1 text-sm font-medium">Loan terms</legend>
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="radio"
                                    name="loan-mode"
                                    checked={loanMode === 'default'}
                                    onChange={() => setLoanMode('default')}
                                    className="mt-1"
                                />
                                <span>
                                    <span className="block text-sm font-medium">Use library default</span>
                                    <span className="block text-xs text-muted-foreground">Student or employee policy is applied automatically.</span>
                                </span>
                            </label>
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="radio"
                                    name="loan-mode"
                                    checked={loanMode === 'custom'}
                                    onChange={() => setLoanMode('custom')}
                                    className="mt-1"
                                />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium">Custom duration</span>
                                    {loanMode === 'custom' && (
                                        <Input
                                            type="number"
                                            min={1}
                                            max={365}
                                            value={days}
                                            onChange={(event) => setDays(Math.min(365, Math.max(1, Number(event.target.value) || 1)))}
                                            className="mt-2"
                                            aria-label="Loan duration in days"
                                        />
                                    )}
                                </span>
                            </label>
                        </fieldset>
                    )}

                    {error && (
                        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing || items.length === 0}>
                            {processing && <LoaderCircle className="size-4 animate-spin" />}
                            {isReserve ? 'Reserve copy' : 'Confirm checkout'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
