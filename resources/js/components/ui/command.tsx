import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            data-slot="command"
            className={cn('flex size-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', className)}
            {...props}
        />
    );
}

function CommandDialog({
    title = 'Search navigation',
    description = 'Search for a library destination.',
    children,
    className,
    ...props
}: React.ComponentProps<typeof Dialog> & {
    title?: string;
    description?: string;
    className?: string;
}) {
    return (
        <Dialog {...props}>
            <DialogContent className={cn('overflow-hidden p-0', className)}>
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground">
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    );
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
    return (
        <div className="flex h-12 items-center gap-2 border-b px-3" data-slot="command-input-wrapper">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <CommandPrimitive.Input
                data-slot="command-input"
                className={cn('h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', className)}
                {...props}
            />
        </div>
    );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
    return <CommandPrimitive.List data-slot="command-list" className={cn('max-h-[22rem] overflow-x-hidden overflow-y-auto p-1', className)} {...props} />;
}

function CommandEmpty(props: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return <CommandPrimitive.Empty data-slot="command-empty" className="py-10 text-center text-sm text-muted-foreground" {...props} />;
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
    return <CommandPrimitive.Group data-slot="command-group" className={cn('overflow-hidden p-1 text-foreground', className)} {...props} />;
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
    return <CommandPrimitive.Separator data-slot="command-separator" className={cn('-mx-1 h-px bg-border', className)} {...props} />;
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            data-slot="command-item"
            className={cn('relative flex min-h-10 cursor-default select-none items-center gap-3 rounded-md px-3 py-2 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50', className)}
            {...props}
        />
    );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
    return <span data-slot="command-shortcut" className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />;
}

export {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
};
