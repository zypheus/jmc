import { useEffect, useState } from 'react';
import { Bookmark, BookOpen, LoaderCircle, ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { CartItem, OpacCopy, OpacDetailPayload } from './types';
import { coverUrl } from './types';

interface OpacRecordDialogProps {
    bookId: number | null;
    coverImage?: string | null;
    open: boolean;
    onOpenChange(open: boolean): void;
    onAdd(item: CartItem): { ok: boolean; message: string };
    onReserve(copy: OpacCopy, title: string, author: string): void;
    onCheckout(copy: OpacCopy, title: string, author: string): void;
    onNotice(message: string, tone?: 'success' | 'error'): void;
}

const descriptionRows: Array<[string, keyof OpacDetailPayload['description']]> = [
    ['Item description', 'general_note'],
    ['Physical description', 'physical_description'],
    ['Bibliography', 'bibliography'],
    ['ISBN', 'isbn'],
    ['Edition', 'edition'],
    ['Published', 'published'],
    ['Series', 'series'],
    ['Subjects / topics', 'subject_topic'],
    ['Subject form', 'subject_form'],
    ['Genre', 'genre'],
];

function AvailabilityBadge({ copy }: { copy: OpacCopy }) {
    if (copy.patron_hold) {
        return (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                {copy.patron_hold_status === 'pending' ? 'Reserved · waiting' : 'On hold'}
            </Badge>
        );
    }

    return (
        <Badge variant={copy.availability === 'Available' ? 'default' : 'secondary'}>
            {copy.circulation_status || copy.availability}
        </Badge>
    );
}

export default function OpacRecordDialog({
    bookId,
    coverImage,
    open,
    onOpenChange,
    onAdd,
    onReserve,
    onCheckout,
    onNotice,
}: OpacRecordDialogProps) {
    const [payload, setPayload] = useState<OpacDetailPayload | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open || !bookId) {
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setPayload(null);
        setError('');

        fetch(`/opac/api/book/${bookId}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('This catalog record is no longer available.');
                }
                return (await response.json()) as OpacDetailPayload;
            })
            .then(setPayload)
            .catch((reason: Error) => {
                if (reason.name !== 'AbortError') {
                    setError(reason.message || 'The catalog record could not be loaded.');
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [bookId, open]);

    function addCopy(copy: OpacCopy) {
        if (!payload) return;
        const result = onAdd({
            id: copy.id,
            title: payload.group.title,
            author: payload.group.author ?? '',
        });
        onNotice(result.message, result.ok ? 'success' : 'error');
    }

    function copyActions(copy: OpacCopy) {
        if (copy.reserved) {
            return <span className="text-xs text-muted-foreground">Room use only</span>;
        }

        if (copy.availability === 'On Hold' && copy.patron_hold_status === 'ready') {
            return (
                <Button
                    size="sm"
                    onClick={() =>
                        payload && onCheckout(copy, payload.group.title, payload.group.author ?? '')
                    }
                >
                    Self-checkout
                </Button>
            );
        }

        if (copy.patron_hold) {
            return <span className="text-xs font-medium text-amber-700">Reserved</span>;
        }

        return (
            <div className="flex flex-wrap gap-2">
                {copy.availability === 'Available' && (
                    <Button size="sm" onClick={() => addCopy(copy)}>
                        <ShoppingCart className="size-3.5" /> Add
                    </Button>
                )}
                {(copy.availability === 'Available' || copy.availability === 'Borrowed') && (
                    <Button size="sm" variant="outline" onClick={() => payload && onReserve(copy, payload.group.title, payload.group.author ?? '')}>
                        <Bookmark className="size-3.5" /> Reserve
                    </Button>
                )}
            </div>
        );
    }

    const availableDescriptionRows = payload
        ? descriptionRows.filter(([, key]) => String(payload.description[key] ?? '').trim() !== '')
        : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] max-w-[min(94vw,78rem)] overflow-y-auto p-0">
                <DialogHeader className="border-b bg-slate-50 px-6 py-5 pr-12">
                    <DialogTitle className="font-display text-xl">
                        {payload?.group.title ?? 'Catalog record'}
                    </DialogTitle>
                    <DialogDescription>
                        {payload
                            ? [payload.group.author, payload.group.year].filter(Boolean).join(' · ') || 'Library record'
                            : 'Loading bibliographic and holdings information.'}
                    </DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="flex min-h-72 items-center justify-center gap-2 text-muted-foreground">
                        <LoaderCircle className="size-5 animate-spin" /> Loading record…
                    </div>
                )}

                {error && <div className="m-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

                {payload && (
                    <div className="space-y-6 p-6">
                        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                            <div className="rounded-xl border bg-white p-3 shadow-sm">
                                <img
                                    src={coverUrl(coverImage)}
                                    alt={`Cover of ${payload.group.title}`}
                                    className="mx-auto aspect-[2/3] max-h-64 w-full object-contain"
                                />
                            </div>
                            <dl className="grid content-start gap-x-6 gap-y-3 text-sm sm:grid-cols-[120px_1fr]">
                                {[
                                    ['Title', payload.description.title],
                                    ['Author', payload.description.main_author],
                                    ['Format', payload.description.format],
                                    ['Edition', payload.description.edition],
                                    ['Published', payload.description.published],
                                    ['ISBN', payload.description.isbn],
                                ].map(([label, value]) =>
                                    value ? (
                                        <div key={label} className="contents">
                                            <dt className="font-medium text-muted-foreground">{label}</dt>
                                            <dd>{value}</dd>
                                        </div>
                                    ) : null,
                                )}
                            </dl>
                        </div>

                        <Tabs defaultValue="description">
                            <TabsList className="h-auto flex-wrap">
                                <TabsTrigger value="description">Description</TabsTrigger>
                                <TabsTrigger value="holdings">Holdings ({payload.copies.length})</TabsTrigger>
                                <TabsTrigger value="marc">MARC view</TabsTrigger>
                            </TabsList>

                            <TabsContent value="description" className="rounded-xl border p-5">
                                {availableDescriptionRows.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No additional description is stored for this title.</p>
                                ) : (
                                    <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-[170px_1fr]">
                                        {availableDescriptionRows.map(([label, key]) => (
                                            <div key={key} className="contents">
                                                <dt className="font-medium text-muted-foreground">{label}</dt>
                                                <dd>{String(payload.description[key])}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}
                            </TabsContent>

                            <TabsContent value="holdings" className="rounded-xl border">
                                <div className="overflow-x-auto">
                                    <Table className="min-w-[1050px] font-[Inter]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Accession</TableHead>
                                                <TableHead>Call no.</TableHead>
                                                <TableHead>Volume</TableHead>
                                                <TableHead>Collection</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Barcode / RFID</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payload.copies.map((copy) => (
                                                <TableRow key={copy.id}>
                                                    <TableCell>{copy.accession_no || '—'}</TableCell>
                                                    <TableCell>{copy.call_number || '—'}</TableCell>
                                                    <TableCell>{copy.volume || '—'}</TableCell>
                                                    <TableCell>{copy.collection || '—'}</TableCell>
                                                    <TableCell>{copy.shelving_location || '—'}</TableCell>
                                                    <TableCell><AvailabilityBadge copy={copy} /></TableCell>
                                                    <TableCell>{[copy.barcode, copy.rfid].filter(Boolean).join(' / ') || '—'}</TableCell>
                                                    <TableCell>{copyActions(copy)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>

                            <TabsContent value="marc" className="rounded-xl border p-5">
                                {payload.marc_view_rows.length === 0 ? (
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <BookOpen className="size-4" /> No common MARC fields are available for this title.
                                    </p>
                                ) : (
                                    <Table className="font-[Inter]">
                                        <TableHeader><TableRow><TableHead>Field</TableHead><TableHead>Value</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {payload.marc_view_rows.map((row, index) => (
                                                <TableRow key={`${row.label}-${index}`}>
                                                    <TableCell className="w-44 font-medium">{row.label}</TableCell>
                                                    <TableCell className="whitespace-pre-wrap">{row.value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
