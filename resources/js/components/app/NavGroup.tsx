import { ChevronDown } from 'lucide-react';

import NavItem from '@/components/app/NavItem';
import { isNavigationBranchActive } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { NavigationGroup } from '@/types/navigation';

interface NavGroupProps {
    group: NavigationGroup;
    routeName?: string | null;
    open: boolean;
    onToggle: () => void;
    onNavigate?: () => void;
}

export default function NavGroup({ group, routeName, open, onToggle, onNavigate }: NavGroupProps) {
    const active = group.items.some((item) => isNavigationBranchActive(item, routeName));

    return (
        <section>
            <button
                type="button"
                className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-100/58 hover:bg-white/6 hover:text-blue-50 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/70 focus-visible:ring-offset-0',
                    active && 'text-white',
                )}
                aria-expanded={open}
                aria-controls={`nav-group-${group.id}`}
                onClick={onToggle}
            >
                <span className="flex-1">{group.label ?? 'Navigation'}</span>
                <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
            </button>
            {open && (
                <div id={`nav-group-${group.id}`} className="mt-1 space-y-1">
                    {group.items.map((item) => <NavItem key={item.id} item={item} routeName={routeName} collapsed={false} onNavigate={onNavigate} />)}
                </div>
            )}
        </section>
    );
}
