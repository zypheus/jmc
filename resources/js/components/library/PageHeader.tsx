import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

interface PageHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
    backHref?: string;
    backLabel?: string;
}

export default function PageHeader({
    eyebrow,
    title,
    description,
    actions,
    backHref,
    backLabel = 'Back',
}: PageHeaderProps) {
    return (
        <div className="space-y-3 border-b pb-4">
            {eyebrow && <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{eyebrow}</p>}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    {backHref && (
                        <Link href={backHref} className="text-sm text-primary hover:underline">
                            &larr; {backLabel}
                        </Link>
                    )}
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
}
