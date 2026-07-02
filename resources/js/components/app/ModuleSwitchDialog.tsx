import { router } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { moduleDefinitions } from '@/config/modules';
import type { PageProps } from '@/types';
import type { AppModule } from '@/types/navigation';

const moduleDescriptions: Record<AppModule, string> = {
    attendance: 'Attendance operations, registrations, logs, reports, and settings.',
    library: 'Catalog, circulation, patrons, reservations, reports, and settings.',
    'super-admin': 'Staff accounts, permissions, and system-wide administration.',
};

export function moduleSwitchOptions(auth: PageProps['auth']): AppModule[] {
    return auth.isSuperAdmin
        ? ['attendance', 'library', 'super-admin']
        : auth.availableModules;
}

interface ModuleSwitchDialogProps {
    auth: PageProps['auth'];
    currentModule: AppModule;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ModuleSwitchDialog({ auth, currentModule, open, onOpenChange }: ModuleSwitchDialogProps) {
    const [processing, setProcessing] = useState<AppModule | null>(null);
    const options = moduleSwitchOptions(auth);

    const selectModule = (nextModule: AppModule) => {
        if (nextModule === currentModule || processing) return;

        setProcessing(nextModule);
        router.post(route('module.switch'), { module: nextModule }, {
            preserveScroll: false,
            onError: () => setProcessing(null),
            onFinish: () => setProcessing(null),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => {
            if (!processing) onOpenChange(nextOpen);
        }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Switch workspace</DialogTitle>
                    <DialogDescription>Select the JMC module you want to open.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2" role="list">
                    {options.map((option) => {
                        const details = moduleDefinitions[option];
                        const Icon = details.icon;
                        const isCurrent = option === currentModule;
                        const isLoading = processing === option;

                        return (
                            <Button
                                key={option}
                                type="button"
                                variant="outline"
                                className={`h-auto min-h-16 justify-start gap-3 whitespace-normal px-4 py-3 text-left ${
                                    isCurrent
                                        ? 'border-[var(--jmc-gold)] bg-[var(--jmc-gold)] text-[var(--jmc-navy)] disabled:opacity-100'
                                        : ''
                                }`}
                                disabled={isCurrent || processing !== null}
                                aria-current={isCurrent ? 'page' : undefined}
                                onClick={() => selectModule(option)}
                            >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                                    <Icon className="size-5" aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-semibold">{details.label}</span>
                                    <span className="block text-sm font-normal text-muted-foreground">{moduleDescriptions[option]}</span>
                                </span>
                                {isCurrent && <><Check className="size-4" aria-hidden="true" /><span className="sr-only">Current workspace</span></>}
                                {isLoading && <span className="text-sm text-muted-foreground" role="status">Opening…</span>}
                            </Button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
