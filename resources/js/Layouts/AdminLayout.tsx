import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

import { Button } from '@/components/ui/button';
import type { PageProps } from '@/types';

export default function AdminLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="border-b bg-foreground text-background">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide opacity-70">Administration</p>
                        <Link href="/dashboard/super-admin" className="text-lg font-semibold">
                            JMC Super Admin
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {auth.user && (
                            <span className="hidden text-sm sm:inline">{auth.user.fullName}</span>
                        )}
                        <Link href="/logout" method="post" as="button">
                            <Button variant="outline" size="sm">
                                Logout
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
    );
}
