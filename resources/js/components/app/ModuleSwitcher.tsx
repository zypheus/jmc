import { router } from '@inertiajs/react';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { moduleDefinitions } from '@/config/modules';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import type { AppModule } from '@/types/navigation';

export default function ModuleSwitcher({ auth, module }: { auth: PageProps['auth']; module: AppModule }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const availableModules = auth.availableModules;
    const current = moduleDefinitions[module];
    const CurrentIcon = current.icon;

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const escape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', escape);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('keydown', escape);
        };
    }, []);

    if (availableModules.length <= 1) {
        return null;
    }

    const selectModule = (nextModule: AppModule) => {
        setOpen(false);
        router.post(route('module.select.store'), { module: nextModule });
    };

    return (
        <div className="relative" ref={rootRef}>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-border bg-white"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <CurrentIcon className="size-4 module-accent-text" aria-hidden="true" />
                <span className="hidden md:inline">{current.shortLabel}</span>
                <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
            </Button>
            {open && (
                <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg" role="menu">
                    <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Switch workspace</p>
                    {availableModules.map((availableModule) => {
                        const details = moduleDefinitions[availableModule];
                        const Icon = details.icon;
                        return (
                            <button
                                key={availableModule}
                                type="button"
                                role="menuitemradio"
                                aria-checked={availableModule === module}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-muted',
                                    availableModule === module && 'bg-muted font-semibold',
                                )}
                                onClick={() => selectModule(availableModule)}
                            >
                                <Icon className="size-4" aria-hidden="true" />
                                <span className="flex-1">{details.label}</span>
                                {availableModule === module && <Check className="size-4 text-primary" aria-hidden="true" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
