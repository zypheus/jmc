import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { ArrowLeft } from 'lucide-react';

import KioskAmbientBackground from '@/components/library/kiosk/KioskAmbientBackground';
import KioskBrandMark from '@/components/library/kiosk/KioskBrandMark';

interface KioskShellProps extends PropsWithChildren {
    title?: string;
}

export default function KioskShell({ children, title = 'Library account' }: KioskShellProps) {
    return (
        <div className="kiosk-theme relative min-h-screen overflow-x-hidden text-white">
            <KioskAmbientBackground />

            <div className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:py-8">
                <header className="mb-8 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <KioskBrandMark size="md" onDark />
                        <div className="text-left">
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">
                                Jose Maria College Library
                            </p>
                            <h1 className="font-display mt-1 text-lg font-semibold text-white sm:text-xl">{title}</h1>
                        </div>
                    </div>
                    <Link
                        href="/kiosk/scan"
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:border-[var(--jmc-gold)]/50 hover:bg-[var(--jmc-blue)]/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jmc-gold)]/60"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to lookup
                    </Link>
                </header>

                <main className="space-y-6 pb-10">{children}</main>
            </div>
        </div>
    );
}
