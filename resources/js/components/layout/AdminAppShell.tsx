import { Link } from '@inertiajs/react';
import { Bell, House, LogOut, Menu, X } from 'lucide-react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

import FlashAlerts from '@/components/FlashAlerts';
import { Button } from '@/components/ui/button';
import type { LibraryBreadcrumbItem } from '@/config/libraryNavigation';
import type { PageProps } from '@/types';
import { cn } from '@/lib/utils';

interface AdminAppShellProps extends PropsWithChildren {
    brandHref: string;
    brandTitle: string;
    brandSubtitle: string;
    portalLabel?: string;
    footerText: string;
    breadcrumbs: LibraryBreadcrumbItem[];
    sidebar: ReactNode;
    auth: PageProps['auth'];
    flash: PageProps['flash'];
}

export default function AdminAppShell({
    brandHref,
    brandTitle,
    brandSubtitle,
    portalLabel = 'Staff portal',
    footerText,
    breadcrumbs,
    sidebar,
    auth,
    flash,
    children,
}: AdminAppShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!mobileOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMobileOpen(false);
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [mobileOpen]);

    const userInitials = auth.user
        ? `${auth.user.fname.charAt(0)}${auth.user.lname.charAt(0)}`.toUpperCase()
        : '?';

    const sidebarBrand = (
        <Link
            href={brandHref}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#F8FAFC]"
        >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#23408E] text-sm font-bold text-white shadow-sm">
                JMC
            </div>
            <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold text-foreground">{brandTitle}</p>
                <p className="truncate text-[11px] text-muted-foreground">{brandSubtitle}</p>
                <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-[#23408E]">
                    {portalLabel}
                </p>
            </div>
        </Link>
    );

    const sidebarUser = auth.user ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#23408E] text-xs font-semibold text-white">
                {userInitials}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{auth.user.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{auth.user.email}</p>
            </div>
        </div>
    ) : null;

    const sidebarPanel = (
        <div className="flex h-full flex-col">
            <div className="border-b border-[#E5E7EB] p-4">{sidebarBrand}</div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Menu
                </p>
                {sidebar}
            </div>
            {sidebarUser ? <div className="border-t border-[#E5E7EB] p-4">{sidebarUser}</div> : null}
        </div>
    );

    return (
        <div className="admin-shell flex min-h-svh bg-[#F8FAFC]">
            <aside className="hidden w-[260px] shrink-0 border-r border-[#E5E7EB] bg-white lg:block">
                {sidebarPanel}
            </aside>

            {mobileOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        aria-label="Close navigation"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative flex h-full w-[min(260px,90vw)] flex-col bg-white shadow-xl">
                        <div className="flex items-center justify-end border-b border-[#E5E7EB] p-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="size-5" />
                            </Button>
                        </div>
                        {sidebarPanel}
                    </aside>
                </div>
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-[70px] shrink-0 items-center gap-3 border-b border-[#E5E7EB] bg-white px-4 shadow-sm">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" />
                    </Button>

                    <nav
                        aria-label="Breadcrumb"
                        className="hidden min-w-0 flex-1 items-center gap-1.5 text-sm text-muted-foreground sm:flex"
                    >
                        <House className="size-4 shrink-0" />
                        {breadcrumbs.map((crumb, index) => (
                            <div key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                                {index > 0 ? <span className="text-muted-foreground/60">/</span> : null}
                                {crumb.href && !crumb.isCurrent ? (
                                    <Link
                                        href={crumb.href}
                                        className="truncate hover:text-[#23408E] hover:underline"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span
                                        className={cn(
                                            'truncate',
                                            crumb.isCurrent && 'font-medium text-foreground',
                                        )}
                                    >
                                        {crumb.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground"
                            aria-label="Notifications"
                        >
                            <Bell className="size-5" />
                        </Button>
                        {auth.user ? (
                            <span className="hidden max-w-[140px] truncate text-sm font-medium md:inline">
                                {auth.user.fullName}
                            </span>
                        ) : null}
                        <Link href="/logout" method="post" as="button">
                            <Button variant="outline" size="sm" className="rounded-[10px]">
                                <LogOut className="size-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6">
                    <FlashAlerts flash={flash} />
                    {children}
                </main>

                <footer className="border-t border-[#E5E7EB] bg-white py-3 text-center text-xs text-muted-foreground">
                    {footerText}
                </footer>
            </div>
        </div>
    );
}
