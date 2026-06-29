import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

import type { BreadcrumbItem } from '@/types/navigation';

export default function AppBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
                <li className="hidden shrink-0 sm:block"><Home className="size-4" aria-hidden="true" /></li>
                {items.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
                        {index > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />}
                        {item.href && !item.current ? (
                            <Link href={item.href} className="truncate hover:text-foreground hover:underline">
                                {item.label}
                            </Link>
                        ) : (
                            <span className={item.current ? 'truncate font-medium text-foreground' : 'hidden truncate sm:inline'}>
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
