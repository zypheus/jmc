import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import {
    ArrowRight,
    BookMarked,
    BookOpen,
    ExternalLink,
    Filter,
    Library,
    Search,
    ShoppingBag,
    Sparkles,
    X,
} from 'lucide-react';

import PaginationLinks from '@/components/PaginationLinks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpacLayout from '@/Layouts/OpacLayout';

import OpacCartDialog from './OpacCartDialog';
import OpacRecordDialog from './OpacRecordDialog';
import PatronActionDialog, { type CheckoutResponse } from './PatronActionDialog';
import { printCheckoutReceipt } from './receipt';
import type { CartItem, LandingPayload, OpacBookSummary, OpacCopy } from './types';
import { coverUrl } from './types';
import { useOpacCart } from './useOpacCart';

type Notice = { message: string; tone: 'success' | 'error' } | null;

interface FilterSelectProps {
    id: string;
    label: string;
    value: string;
    allValue: string;
    options: string[];
    onChange(value: string): void;
}

function FilterSelect({ id, label, value, allValue, options, onChange }: FilterSelectProps) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
            <Select value={value || allValue} onValueChange={onChange}>
                <SelectTrigger id={id}><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value={allValue}>All {label.toLowerCase()}</SelectItem>
                    {options.filter(Boolean).map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    );
}

function BookCover({ book, className = '' }: { book: OpacBookSummary; className?: string }) {
    return (
        <img
            src={coverUrl(book.cover_image)}
            alt={`Cover of ${book.title_statement}`}
            className={`bg-slate-100 object-cover ${className}`}
            onError={(event) => { event.currentTarget.src = '/images/defaultBook.png'; }}
        />
    );
}

export default function Landing({ carouselBooks, carouselMeta, libraryBooks, libraryEbooks, filters }: LandingPayload) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [facetValues, setFacetValues] = useState({
        course: filters.course,
        subject_topic: filters.subjectTopic,
        genre: filters.genre,
        section: filters.section,
        content_type: filters.contentType,
    });
    const [selectedBook, setSelectedBook] = useState<{ id: number; cover: string | null } | null>(null);
    const [recordOpen, setRecordOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [action, setAction] = useState<{ mode: 'reserve' | 'checkout'; items: CartItem[] } | null>(null);
    const [notice, setNotice] = useState<Notice>(null);
    const cart = useOpacCart();

    useEffect(() => {
        setSearch(filters.search ?? '');
        setFacetValues({
            course: filters.course,
            subject_topic: filters.subjectTopic,
            genre: filters.genre,
            section: filters.section,
            content_type: filters.contentType,
        });
    }, [filters]);

    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(null), 5000);
        return () => window.clearTimeout(timer);
    }, [notice]);

    const viewMode = filters.viewMode;

    function query(overrides: Record<string, string | undefined> = {}) {
        return {
            search: search.trim() || undefined,
            view: viewMode,
            course: facetValues.course !== 'all' ? facetValues.course : undefined,
            subject_topic: facetValues.subject_topic !== 'All' ? facetValues.subject_topic : undefined,
            genre: facetValues.genre !== 'All' ? facetValues.genre : undefined,
            section: facetValues.section !== 'All' ? facetValues.section : undefined,
            content_type: facetValues.content_type !== 'All' ? facetValues.content_type : undefined,
            ...overrides,
        };
    }

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/opac', query(), { preserveScroll: false });
    }

    function switchView(next: string) {
        router.get('/opac', query({ view: next }), { preserveScroll: false });
    }

    function changeFacet(key: keyof typeof facetValues, value: string) {
        const next = { ...facetValues, [key]: value };
        setFacetValues(next);
        router.get('/opac', {
            search: search.trim() || undefined,
            view: viewMode,
            course: next.course !== 'all' ? next.course : undefined,
            subject_topic: next.subject_topic !== 'All' ? next.subject_topic : undefined,
            genre: next.genre !== 'All' ? next.genre : undefined,
            section: next.section !== 'All' ? next.section : undefined,
            content_type: next.content_type !== 'All' ? next.content_type : undefined,
        }, { preserveScroll: true });
    }

    function openRecord(book: OpacBookSummary) {
        setSelectedBook({ id: book.id, cover: book.cover_image ?? null });
        setRecordOpen(true);
    }

    function showNotice(message: string, tone: 'success' | 'error' = 'success') {
        setNotice({ message, tone });
    }

    function reserve(copy: OpacCopy, title: string, author: string) {
        setAction({
            mode: 'reserve',
            items: [{ id: copy.id, title, author }],
        });
    }

    function checkoutCopy(copy: OpacCopy, title: string, author: string) {
        setAction({ mode: 'checkout', items: [{ id: copy.id, title, author }] });
    }

    async function actionSucceeded(data: CheckoutResponse | { success: true; message: string }) {
        if ('books' in data) {
            data.books.forEach((book) => cart.remove(book.id));
            showNotice(`${data.books.length} ${data.books.length === 1 ? 'book was' : 'books were'} checked out successfully.`);
            try {
                await printCheckoutReceipt(data.patron, data.books);
            } catch {
                showNotice('Checkout succeeded, but the receipt could not print. Check QZ Tray and the GLPrint printer.', 'error');
            }
        } else {
            showNotice(data.message || 'The copy was reserved.');
        }

        setRecordOpen(false);
        setCartOpen(false);
        router.reload({ only: ['carouselMeta', 'libraryBooks'] });
    }

    const filterPanel = (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-display font-semibold"><Filter className="size-4" /> Refine results</div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.get('/opac', { search: filters.search, view: viewMode })}
                >
                    Reset
                </Button>
            </div>
            <FilterSelect id="format" label="Format" value={facetValues.content_type} allValue="All" options={filters.contentTypes} onChange={(value) => changeFacet('content_type', value)} />
            <FilterSelect id="section" label="Section" value={facetValues.section} allValue="All" options={filters.sections} onChange={(value) => changeFacet('section', value)} />
            <FilterSelect id="subject" label="Subject" value={facetValues.subject_topic} allValue="All" options={filters.subjectTopics} onChange={(value) => changeFacet('subject_topic', value)} />
            <FilterSelect id="genre" label="Genre" value={facetValues.genre} allValue="All" options={filters.genres} onChange={(value) => changeFacet('genre', value)} />
            <FilterSelect id="course" label="Course" value={facetValues.course} allValue="all" options={filters.courses} onChange={(value) => changeFacet('course', value)} />
        </div>
    );

    return (
        <OpacLayout>
            <Head title="Library OPAC" />

            {notice && (
                <div
                    role="status"
                    className={`fixed right-4 top-4 z-[80] max-w-md rounded-xl border px-4 py-3 text-sm shadow-xl ${
                        notice.tone === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'border-red-200 bg-red-50 text-red-900'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <span className="flex-1">{notice.message}</span>
                        <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss"><X className="size-4" /></button>
                    </div>
                </div>
            )}

            {!filters.searchActive ? (
                <div className="space-y-12">
                    <section className="relative overflow-hidden rounded-[2rem] bg-[var(--jmc-navy)] px-6 py-14 text-white shadow-2xl sm:px-10 lg:px-16">
                        <div className="absolute -right-20 -top-24 size-80 rounded-full bg-[var(--jmc-green)]/20 blur-3xl" />
                        <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-[var(--jmc-blue)]/40 blur-3xl" />
                        <div className="relative mx-auto max-w-4xl text-center">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--jmc-gold)]">Online public access catalog</p>
                            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Find your next book at JMC</h1>
                            <p className="mx-auto mt-4 max-w-2xl text-base text-white/75 sm:text-lg">Search titles, authors, subjects, and keywords across the library collection.</p>
                            <form onSubmit={submitSearch} className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                    <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-12 border-0 bg-transparent pl-12 text-slate-900 shadow-none focus-visible:ring-0" placeholder="Title, author, or keywords…" aria-label="Search the library catalog" />
                                </div>
                                <Button type="submit" size="lg" className="h-12 bg-[var(--jmc-green)] px-8 hover:bg-[var(--jmc-green)]/90">Search catalog</Button>
                            </form>
                            <p className="mt-3 text-xs text-white/55">New arrivals are on the shelf below. Filters appear after you search.</p>
                        </div>
                    </section>

                    <section aria-labelledby="new-arrivals-heading">
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--jmc-green)]"><Sparkles className="size-4" /> Recently cataloged</p>
                                <h2 id="new-arrivals-heading" className="mt-2 font-display text-2xl font-semibold">New arrival shelf</h2>
                            </div>
                            <Button variant="outline" onClick={() => router.get('/opac', { view: 'ebooks' })}>Browse e-books <ArrowRight className="size-4" /></Button>
                        </div>
                        <div className="relative overflow-x-auto pb-6">
                            <div className="flex min-w-max gap-5 px-2 pb-5">
                                {carouselBooks.length === 0 ? (
                                    <div className="w-full rounded-xl border border-dashed p-10 text-center text-muted-foreground">New arrivals will appear here after books are cataloged.</div>
                                ) : carouselBooks.map((book) => {
                                    const meta = carouselMeta[book.id] ?? { copies: 1, is_available: false };
                                    return (
                                        <button key={book.id} type="button" onClick={() => openRecord(book)} className="group w-40 text-left">
                                            <div className="relative overflow-hidden rounded-t-lg border bg-white shadow-md transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl motion-reduce:transform-none">
                                                <BookCover book={book} className="aspect-[2/3] w-full" />
                                                <Badge className="absolute bottom-2 left-2" variant={meta.is_available ? 'default' : 'secondary'}>{meta.is_available ? 'Available' : 'Checked out'}</Badge>
                                            </div>
                                            <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{book.title_statement}</p>
                                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{book.main_author || 'Unknown author'} · {meta.copies} {meta.copies === 1 ? 'copy' : 'copies'}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="h-2 rounded-full bg-[var(--jmc-gold)] shadow-[0_5px_14px_rgba(21,54,111,0.22)]" aria-hidden="true" />
                        </div>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2">
                        <a href="https://zendy.io" target="_blank" rel="noreferrer" className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:border-[var(--jmc-blue)]/40 hover:shadow-md">
                            <div className="flex items-center gap-4"><img src="/images/zendy.png" alt="Zendy" className="size-14 rounded-xl object-contain" /><div><p className="font-display font-semibold">Explore Zendy</p><p className="text-sm text-muted-foreground">Open journals and research resources.</p></div><ExternalLink className="ml-auto size-5 text-muted-foreground group-hover:text-primary" /></div>
                        </a>
                        <Link href="/" className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:border-[var(--jmc-green)]/40 hover:shadow-md">
                            <div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-xl bg-[var(--jmc-blue)] text-white"><Library className="size-7" /></div><div><p className="font-display font-semibold">JMC home</p><p className="text-sm text-muted-foreground">Return to the main attendance and library portal.</p></div><ArrowRight className="ml-auto size-5 text-muted-foreground group-hover:text-primary" /></div>
                        </Link>
                    </section>
                </div>
            ) : (
                <div className="space-y-6">
                    <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                        <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder={viewMode === 'ebooks' ? 'Search e-books…' : 'Search books…'} /></div>
                            <Button type="submit">Search</Button>
                            <Button type="button" variant="outline" onClick={() => router.get('/opac')}>Clear</Button>
                        </form>
                    </section>

                    <Tabs value={viewMode} onValueChange={switchView}>
                        <TabsList><TabsTrigger value="books"><BookOpen className="size-4" /> Books</TabsTrigger><TabsTrigger value="ebooks"><BookMarked className="size-4" /> E-books</TabsTrigger></TabsList>
                        <TabsContent value="books" className="mt-5">
                            <details className="mb-4 rounded-xl border bg-white p-4 lg:hidden"><summary className="cursor-pointer font-medium">Filters</summary><div className="mt-4">{filterPanel}</div></details>
                            <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                                <aside className="sticky top-4 hidden self-start rounded-2xl border bg-white p-5 shadow-sm lg:block">{filterPanel}</aside>
                                <main>
                                    <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-sm text-muted-foreground">Library catalog</p><h1 className="font-display text-2xl font-semibold">{libraryBooks.total} {libraryBooks.total === 1 ? 'title' : 'titles'} found</h1>{filters.search && <p className="mt-1 text-sm text-muted-foreground">Matches for “{filters.search}”</p>}</div></div>
                                    {libraryBooks.data.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed bg-white p-12 text-center"><Search className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-4 font-display text-lg font-semibold">No titles matched your search</h2><p className="mt-1 text-sm text-muted-foreground">Try different keywords or reset the catalog filters.</p></div>
                                    ) : (
                                        <div className="space-y-3">
                                            {libraryBooks.data.map((book) => (
                                                <button key={book.id} type="button" onClick={() => openRecord(book)} className="group grid w-full gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-[var(--jmc-blue)]/35 hover:shadow-md sm:grid-cols-[84px_1fr_auto]">
                                                    <BookCover book={book} className="aspect-[2/3] w-20 rounded-md" />
                                                    <div className="min-w-0"><h2 className="font-display text-lg font-semibold text-[var(--jmc-navy)] group-hover:text-[var(--jmc-blue)]">{book.title_statement}</h2><p className="mt-1 text-sm text-muted-foreground">{book.main_author || 'Unknown author'}{book.pub_year ? ` · ${book.pub_year}` : ''}</p><div className="mt-3 flex flex-wrap gap-2">{book.content_type && <Badge variant="outline">{book.content_type}</Badge>}{book.course && <Badge variant="secondary">{book.course}</Badge>}<Badge variant="outline">{book.copies ?? 1} {(book.copies ?? 1) === 1 ? 'copy' : 'copies'}</Badge></div></div>
                                                    <Badge className="self-start" variant={Boolean(book.is_available) ? 'default' : 'secondary'}>{Boolean(book.is_available) ? 'Available' : 'Not available'}</Badge>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <PaginationLinks links={libraryBooks.links} />
                                </main>
                            </div>
                        </TabsContent>
                        <TabsContent value="ebooks" className="mt-5">
                            <div className="mb-4"><p className="text-sm text-muted-foreground">Digital collection</p><h1 className="font-display text-2xl font-semibold">{libraryEbooks?.total ?? 0} e-books found</h1></div>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {(libraryEbooks?.data ?? []).map((ebook) => (
                                    <Card key={ebook.id}><CardContent className="flex h-full flex-col p-5"><Badge variant="outline" className="mb-3 w-fit">E-book</Badge><h2 className="font-display text-lg font-semibold">{ebook.title}</h2><p className="mt-1 text-sm text-muted-foreground">{ebook.author || 'Unknown author'}{ebook.publication_year ? ` · ${ebook.publication_year}` : ''}</p>{ebook.source && <p className="mt-3 text-xs text-muted-foreground">Source: {ebook.source}</p>}<div className="mt-auto pt-5">{ebook.link ? <Button asChild className="w-full"><a href={ebook.link} target="_blank" rel="noreferrer">Open e-book <ExternalLink className="size-4" /></a></Button> : <p className="text-sm text-muted-foreground">No public link is available.</p>}</div></CardContent></Card>
                                ))}
                            </div>
                            {(libraryEbooks?.data.length ?? 0) === 0 && <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">No e-books matched your search.</div>}
                            {libraryEbooks && <PaginationLinks links={libraryEbooks.links} />}
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            <Button type="button" onClick={() => setCartOpen(true)} className="fixed bottom-6 right-6 z-40 h-12 rounded-full px-5 shadow-xl" aria-label={`Open borrow cart with ${cart.items.length} books`}>
                <ShoppingBag className="size-5" /> Cart <Badge variant="secondary" className="ml-1">{cart.items.length}</Badge>
            </Button>

            <OpacRecordDialog
                bookId={selectedBook?.id ?? null}
                coverImage={selectedBook?.cover}
                open={recordOpen}
                onOpenChange={setRecordOpen}
                onAdd={cart.add}
                onReserve={reserve}
                onCheckout={checkoutCopy}
                onNotice={showNotice}
            />
            <OpacCartDialog items={cart.items} open={cartOpen} onOpenChange={setCartOpen} onRemove={cart.remove} onCheckout={() => setAction({ mode: 'checkout', items: cart.items })} />
            <PatronActionDialog mode={action?.mode ?? 'checkout'} items={action?.items ?? []} open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)} onSuccess={actionSucceeded} />
        </OpacLayout>
    );
}
