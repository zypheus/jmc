import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

export default function OpacLayout({ children }: PropsWithChildren) {
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!mobileOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [mobileOpen]);

    useEffect(() => {
        const desktopQuery = window.matchMedia('(min-width: 1024px)');
        const closeOnDesktop = () => {
            if (desktopQuery.matches) setMobileOpen(false);
        };

        if (typeof desktopQuery.addEventListener === 'function') {
            desktopQuery.addEventListener('change', closeOnDesktop);
            return () => desktopQuery.removeEventListener('change', closeOnDesktop);
        }

        desktopQuery.addListener(closeOnDesktop);
        return () => desktopQuery.removeListener(closeOnDesktop);
    }, []);

    const closeMobile = () => setMobileOpen(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b bg-white shadow-sm" role="banner">
                <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:justify-between">
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

                    <button
                        type="button"
                        className="ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-[var(--jmc-blue)] lg:hidden"
                        aria-label={mobileOpen ? 'Close OPAC navigation' : 'Open OPAC navigation'}
                        aria-expanded={mobileOpen}
                        aria-controls="opac-primary-navigation"
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
                    </button>

                    <nav
                        id="opac-primary-navigation"
                        className={`${mobileOpen ? 'flex' : 'hidden'} w-full flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 text-sm font-medium shadow-lg lg:flex lg:w-auto lg:flex-row lg:flex-wrap lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
                        aria-label="OPAC navigation"
                    >
                        <a href="/" onClick={closeMobile} className="rounded-lg px-3 py-3 text-slate-700 transition hover:bg-slate-100 hover:text-[var(--jmc-blue)] lg:py-2 lg:text-slate-600">
                            Home
                        </a>
                        <Link href="/kiosk/scan" onClick={closeMobile} className="rounded-lg px-3 py-3 text-slate-700 transition hover:bg-slate-100 hover:text-[var(--jmc-blue)] lg:py-2 lg:text-slate-600">
                            Patron lookup
                        </Link>
                        <Link href="/opac" onClick={closeMobile} className="rounded-lg bg-[var(--jmc-navy)] px-3 py-3 text-white transition hover:bg-[var(--jmc-blue)] lg:py-2">
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
