import { PropsWithChildren } from 'react';

interface PatronIdentityCardProps {
    name: string;
    lines: string[];
    avatarUrl: string | null;
    initials: string;
}

export default function PatronIdentityCard({
    name,
    lines,
    avatarUrl,
    initials,
    children,
}: PatronIdentityCardProps & PropsWithChildren) {
    return (
        <section className="kiosk-identity-card relative overflow-hidden rounded-2xl border border-white/10 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
            <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--jmc-gold)]/10 blur-3xl"
                aria-hidden
            />
            <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                    <div className="kiosk-avatar-ring absolute -inset-1 rounded-full opacity-90 blur-sm" />
                    <div className="relative rounded-full bg-[var(--jmc-navy)] p-1">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt=""
                                className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
                            />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--jmc-blue)]/25 text-2xl font-semibold text-white sm:h-28 sm:w-28 sm:text-3xl">
                                {initials}
                            </div>
                        )}
                    </div>
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--jmc-gold)]">
                        Patron account
                    </p>
                    <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        {name}
                    </h1>
                    <dl className="mt-3 space-y-1">
                        {lines.map((line) => (
                            <dd key={line} className="text-sm text-white/65">
                                {line}
                            </dd>
                        ))}
                    </dl>
                    {children && <div className="mt-4">{children}</div>}
                </div>
            </div>
        </section>
    );
}
