import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function OpacLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b bg-white shadow-sm" role="banner">
                <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                    <Link href="/opac" className="flex min-w-0 items-center gap-3 text-slate-900">
                        <img src="/images/djmc.png" alt="Jose Maria College seal" className="size-12 shrink-0 object-contain sm:size-14" />
                        <span className="min-w-0">
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--jmc-green)] sm:text-xs">
                                Online public access catalog
                            </span>
                            <span className="block truncate font-display text-base font-semibold text-[var(--jmc-navy)] sm:text-lg">
                                Jose Maria College Library
                            </span>
                        </span>
                    </Link>

                    <nav className="flex flex-wrap items-center gap-1 text-sm font-medium" aria-label="OPAC navigation">
                        <Link href="/" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-[var(--jmc-blue)]">
                            Home
                        </Link>
                        <Link href="/kiosk/scan" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-[var(--jmc-blue)]">
                            Patron lookup
                        </Link>
                        <Link href="/opac" className="rounded-lg bg-[var(--jmc-navy)] px-3 py-2 text-white transition hover:bg-[var(--jmc-blue)]">
                            Catalog
                        </Link>
                    </nav>
                </div>
                <div className="h-1 bg-[var(--jmc-gold)]" />
            </header>

            <main className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6">{children}</main>
        </div>
    );
}
