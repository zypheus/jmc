import * as React from 'react';

import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            data-slot="card"
            className={cn(
                'flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10',
                className,
            )}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div data-slot="card-header" className={cn('flex flex-col gap-1', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 data-slot="card-title" className={cn('text-lg font-semibold leading-snug', className)} {...props} />
    );
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p data-slot="card-description" className={cn('text-sm text-muted-foreground', className)} {...props} />
    );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div data-slot="card-content" className={cn('', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            data-slot="card-footer"
            className={cn('flex items-center border-t pt-4', className)}
            {...props}
        />
    );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
