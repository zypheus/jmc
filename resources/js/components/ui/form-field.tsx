import * as React from 'react';
import { useEffect, useRef } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FieldControlProps {
    id: string;
    'aria-invalid'?: true;
    'aria-describedby'?: string;
    required?: boolean;
}

interface FormFieldProps {
    id: string;
    label: React.ReactNode;
    error?: string;
    description?: React.ReactNode;
    required?: boolean;
    className?: string;
    children: (props: FieldControlProps) => React.ReactNode;
}

function FormField({ id, label, error, description, required, className, children }: FormFieldProps) {
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor={id}>
                {label}
                {required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
                {required && <span className="sr-only"> (required)</span>}
            </Label>
            {description && <p id={descriptionId} className="text-sm text-muted-foreground">{description}</p>}
            {children({
                id,
                required,
                'aria-invalid': error ? true : undefined,
                'aria-describedby': describedBy,
            })}
            {error && <p id={errorId} className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

function FormErrorSummary({ errors, title = 'Please correct the following fields.' }: {
    errors: Record<string, string | undefined>;
    title?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const messages = Object.entries(errors).filter((entry): entry is [string, string] => Boolean(entry[1]));

    useEffect(() => {
        if (!messages.length) return;
        ref.current?.focus();
        requestAnimationFrame(() => {
            document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        });
    }, [messages.length]);

    if (!messages.length) return null;

    return (
        <div ref={ref} tabIndex={-1} role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-semibold">{title}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
                {messages.map(([field, message]) => <li key={field}>{message}</li>)}
            </ul>
        </div>
    );
}

export { FormErrorSummary, FormField };
export type { FieldControlProps };
