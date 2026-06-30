import { Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';

interface LookupStatusAlertProps {
    status: string | null | undefined;
    variant?: 'default' | 'kiosk';
}

export default function LookupStatusAlert({ status, variant = 'default' }: LookupStatusAlertProps) {
    if (!status) {
        return null;
    }

    const isKiosk = variant === 'kiosk';

    if (status === 'pending_student') {
        return (
            <div
                className={`rounded-2xl px-5 py-4 sm:px-6 ${
                    isKiosk ? 'kiosk-alert-warning text-white' : 'border-amber-300 bg-amber-50 text-amber-950'
                }`}
            >
                <h3 className="font-display text-sm font-semibold">Registration pending approval</h3>
                <p className={`mt-2 text-sm leading-relaxed ${isKiosk ? 'text-white/70' : ''}`}>
                    Your library student registration is waiting for staff approval. Lookup will work once
                    your account is active.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/register/library">
                        <Button size="sm" variant={isKiosk ? 'secondary' : 'outline'}>
                            Register again
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button size="sm" variant="ghost" className={isKiosk ? 'text-white/80 hover:text-white' : ''}>
                            Registration options
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (status === 'pending_employee') {
        return (
            <div
                className={`rounded-2xl px-5 py-4 sm:px-6 ${
                    isKiosk ? 'kiosk-alert-warning text-white' : 'border-amber-300 bg-amber-50 text-amber-950'
                }`}
            >
                <h3 className="font-display text-sm font-semibold">Registration pending approval</h3>
                <p className={`mt-2 text-sm leading-relaxed ${isKiosk ? 'text-white/70' : ''}`}>
                    Your library employee registration is pending. Try again after staff approves your account.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/register/library/employee">
                        <Button size="sm" variant={isKiosk ? 'secondary' : 'outline'}>
                            Register again
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button size="sm" variant="ghost" className={isKiosk ? 'text-white/80 hover:text-white' : ''}>
                            Registration options
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`rounded-2xl px-5 py-4 sm:px-6 ${
                isKiosk ? 'border-red-500/35 bg-red-500/10 text-white' : 'border-red-300 bg-red-50 text-red-950'
            }`}
        >
            <h3 className="font-display text-sm font-semibold">No library account found</h3>
            <p className={`mt-2 text-sm leading-relaxed ${isKiosk ? 'text-white/70' : ''}`}>
                That ID or QR code is not linked to an approved library account yet.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/register/library">
                    <Button size="sm" variant={isKiosk ? 'secondary' : 'secondary'}>
                        Register as student
                    </Button>
                </Link>
                <Link href="/register/library/employee">
                    <Button size="sm" variant={isKiosk ? 'secondary' : 'secondary'}>
                        Register as employee
                    </Button>
                </Link>
            </div>
        </div>
    );
}
