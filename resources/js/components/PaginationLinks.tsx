import { Link } from '@inertiajs/react';

import type { Paginated } from '@/types';

import { cn } from '@/lib/utils';

export default function PaginationLinks({ links }: { links: Paginated<unknown>['links'] }) {
    return (
        <div className="mt-4 flex flex-wrap gap-1">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        className={cn(
                            'rounded-md border px-3 py-1 text-sm transition-colors',
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'hover:bg-muted',
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={index}
                        className="px-3 py-1 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}
