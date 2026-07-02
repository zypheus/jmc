import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import ModuleSwitchDialog, { moduleSwitchOptions } from '@/components/app/ModuleSwitchDialog';
import { Button } from '@/components/ui/button';
import { moduleDefinitions } from '@/config/modules';
import type { PageProps } from '@/types';
import type { AppModule } from '@/types/navigation';

export default function ModuleSwitcher({ auth, module }: { auth: PageProps['auth']; module: AppModule }) {
    const [open, setOpen] = useState(false);
    const options = moduleSwitchOptions(auth);
    const current = moduleDefinitions[module];
    const CurrentIcon = current.icon;

    if (options.length <= 1) return null;

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-border bg-white"
                aria-haspopup="dialog"
                onClick={() => setOpen(true)}
            >
                <CurrentIcon className="size-4 module-accent-text" aria-hidden="true" />
                <span className="hidden md:inline">{current.shortLabel}</span>
                <ChevronDown className="size-3.5" aria-hidden="true" />
            </Button>
            <ModuleSwitchDialog auth={auth} currentModule={module} open={open} onOpenChange={setOpen} />
        </>
    );
}
