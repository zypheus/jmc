import { PropsWithChildren, ReactNode } from 'react';

interface KioskPanelProps extends PropsWithChildren {
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function KioskPanel({ title, description, action, children }: KioskPanelProps) {
    return (
        <section className="kiosk-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 bg-[var(--jmc-blue)]/10 px-5 py-4 sm:px-6">
                <div>
                    <h2 className="font-display text-sm font-semibold tracking-wide text-white">{title}</h2>
                    {description && <p className="mt-1 text-sm text-white/55">{description}</p>}
                </div>
                {action}
            </div>
            <div>{children}</div>
        </section>
    );
}
