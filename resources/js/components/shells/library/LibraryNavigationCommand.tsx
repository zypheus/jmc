import { router } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { hasNavigationDestination, navigationHref, navigationMode } from '@/lib/navigation';
import type { NavigationGroup, NavigationItem } from '@/types/navigation';

interface LibraryNavigationCommandProps {
    groups: NavigationGroup[];
    open: boolean;
    onOpenChange(open: boolean): void;
}

interface CommandEntry {
    groupId: string;
    groupLabel: string;
    parentLabel?: string;
    item: NavigationItem;
}

export default function LibraryNavigationCommand({ groups, open, onOpenChange }: LibraryNavigationCommandProps) {
    const entries = useMemo<CommandEntry[]>(() => groups.flatMap((group) => group.items.flatMap((item) => {
        if (item.children?.length) {
            return item.children
                .filter(hasNavigationDestination)
                .map((child) => ({
                    groupId: group.id,
                    groupLabel: group.label ?? 'Navigation',
                    parentLabel: item.label,
                    item: child,
                }));
        }

        return hasNavigationDestination(item)
            ? [{ groupId: group.id, groupLabel: group.label ?? 'Navigation', item }]
            : [];
    })), [groups]);

    useEffect(() => {
        const shortcut = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                onOpenChange(!open);
            }
        };
        document.addEventListener('keydown', shortcut);
        return () => document.removeEventListener('keydown', shortcut);
    }, [onOpenChange, open]);

    function navigate(item: NavigationItem) {
        const href = navigationHref(item);
        const mode = navigationMode(item);
        onOpenChange(false);

        if (mode === 'new-tab') {
            window.open(href, '_blank', 'noopener,noreferrer');
            return;
        }

        if (mode === 'document') {
            window.location.assign(href);
            return;
        }

        router.visit(href);
    }

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
            <CommandInput placeholder="Search library navigation…" autoFocus />
            <CommandList>
                <CommandEmpty>No matching library destination.</CommandEmpty>
                {groups.map((group) => {
                    const groupEntries = entries.filter((entry) => entry.groupId === group.id);
                    if (!groupEntries.length) return null;

                    return (
                        <CommandGroup key={group.id} heading={group.label}>
                            {groupEntries.map(({ item, parentLabel }) => {
                                const Icon = item.icon;
                                const newTab = navigationMode(item) === 'new-tab';
                                const value = [item.label, parentLabel, ...(item.keywords ?? [])].filter(Boolean).join(' ');
                                return (
                                    <CommandItem key={item.id} value={value} onSelect={() => navigate(item)}>
                                        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate font-medium">{item.label}</span>
                                            {parentLabel && <span className="block truncate text-xs text-muted-foreground">{parentLabel}</span>}
                                        </span>
                                        {newTab && <ExternalLink className="size-3.5 text-muted-foreground" aria-label="Opens in a new tab" />}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    );
                })}
            </CommandList>
            <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
                <span>Use ↑↓ to move · Enter to open</span>
                <span>Esc to close</span>
            </div>
        </CommandDialog>
    );
}
