import { Head, usePage } from '@inertiajs/react';

import KioskBrandMark from '@/components/library/kiosk/KioskBrandMark';
import LookupStatusAlert from '@/components/library/kiosk/LookupStatusAlert';
import PatronLookupForm from '@/components/library/kiosk/PatronLookupForm';
import KioskLookupLayout from '@/Layouts/KioskLookupLayout';
import type { PageProps } from '@/types';

export default function Lookup() {
    const { flash } = usePage<PageProps>().props;

    return (
        <KioskLookupLayout>
            <Head title="Patron Lookup" />

            <div className="w-full max-w-lg space-y-8 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
                <KioskBrandMark
                    size="lg"
                    showTagline
                    onDark
                    title="Find your library account"
                    subtitle="Scan or type your student ID, employee ID, or QR code to view loans and fines."
                />

                {flash.lookup_status && (
                    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-500">
                        <LookupStatusAlert status={flash.lookup_status} variant="kiosk" />
                    </div>
                )}

                <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                    <div className="kiosk-card-header-gradient border-b border-slate-100 px-6 py-5">
                        <p className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-[var(--jmc-blue)]">
                            Self-service lookup
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            This kiosk opens your circulation record only — no password required.
                        </p>
                    </div>
                    <div className="px-6 py-6 sm:px-8 sm:py-7">
                        <PatronLookupForm />
                    </div>
                </div>

                <p className="text-center text-xs leading-relaxed text-white/40">
                    New patrons must register and wait for library staff approval before lookup works.
                </p>
            </div>
        </KioskLookupLayout>
    );
}
