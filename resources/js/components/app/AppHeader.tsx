import { Menu, PanelLeft } from 'lucide-react';

import AppBreadcrumbs from '@/components/app/AppBreadcrumbs';
import ModuleSwitcher from '@/components/app/ModuleSwitcher';
import NotificationMenu from '@/components/app/NotificationMenu';
import UserMenu from '@/components/app/UserMenu';
import { Button } from '@/components/ui/button';
import { moduleDefinitions } from '@/config/modules';
import type { PageProps } from '@/types';
import type { AppModule, BreadcrumbItem } from '@/types/navigation';

interface AppHeaderProps {
    module: AppModule;
    auth: PageProps['auth'];
    breadcrumbs: BreadcrumbItem[];
    adminActivity?: PageProps['adminActivity'] | null;
    onOpenMobile: () => void;
    onToggleCollapsed: () => void;
    onLogout: () => void;
}

export default function AppHeader({ module, auth, breadcrumbs, adminActivity, onOpenMobile, onToggleCollapsed, onLogout }: AppHeaderProps) {
    const ModuleIcon = moduleDefinitions[module].icon;

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-white/96 px-3 backdrop-blur md:px-5">
            <Button type="button" variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={onOpenMobile}>
                <Menu className="size-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="hidden lg:inline-flex" aria-label="Collapse navigation" onClick={onToggleCollapsed}>
                <PanelLeft className="size-5" />
            </Button>
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--module-tint)] text-[var(--module-accent)] sm:hidden">
                    <ModuleIcon className="size-4" aria-hidden="true" />
                </span>
                <AppBreadcrumbs items={breadcrumbs} />
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1.5">
                <ModuleSwitcher auth={auth} module={module} />
                <NotificationMenu payload={adminActivity} />
                <UserMenu auth={auth} currentModule={module} onLogout={onLogout} />
            </div>
        </header>
    );
}
