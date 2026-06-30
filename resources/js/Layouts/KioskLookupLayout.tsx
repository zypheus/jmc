import { PropsWithChildren } from 'react';

import KioskAmbientBackground from '@/components/library/kiosk/KioskAmbientBackground';

/**
 * Standalone kiosk terminal — no site navigation.
 */
export default function KioskLookupLayout({ children }: PropsWithChildren) {
    return (
        <div className="kiosk-theme relative min-h-screen overflow-x-hidden text-white">
            <KioskAmbientBackground />
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:py-14">
                {children}
            </div>
        </div>
    );
}
