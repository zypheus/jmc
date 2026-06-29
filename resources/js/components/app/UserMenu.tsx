import { Link } from '@inertiajs/react';
import { ChevronDown, LogOut, Settings, Shuffle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import RoleBadge from '@/components/app/RoleBadge';
import type { PageProps } from '@/types';

interface UserMenuProps {
    auth: PageProps['auth'];
    onLogout: () => void;
}

export function UserAvatar({ auth, className = 'size-8' }: { auth: PageProps['auth']; className?: string }) {
    const user = auth.user;
    if (user?.avatarUrl) {
        return <img src={user.avatarUrl} alt="" className={`${className} rounded-full object-cover`} />;
    }
    return <span className={`${className} flex items-center justify-center rounded-full bg-primary text-xs font-semibold text-white`}>{user?.initials ?? 'U'}</span>;
}

export default function UserMenu({ auth, onLogout }: UserMenuProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const user = auth.user;

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };
        const escape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', escape);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('keydown', escape);
        };
    }, []);

    return (
        <div className="relative" ref={rootRef}>
            <Button type="button" variant="ghost" className="h-10 gap-1 rounded-full px-1.5" aria-label="Open user menu" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
                <UserAvatar auth={auth} />
                <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            </Button>
            {open && (
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border bg-popover p-2 shadow-lg" role="menu">
                    <div className="border-b px-2 pb-3 pt-1">
                        <p className="truncate font-display text-sm font-semibold">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {user?.roles.map((role) => <RoleBadge key={role} role={role} />)}
                        </div>
                    </div>
                    <div className="space-y-1 pt-1">
                        <Link href={route('account.edit')} role="menuitem" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
                            <Settings className="size-4" aria-hidden="true" /> My Account
                        </Link>
                        {auth.availableModules.length > 1 && (
                            <Link href={route('module.select')} role="menuitem" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
                                <Shuffle className="size-4" aria-hidden="true" /> Switch Module
                            </Link>
                        )}
                        <button type="button" role="menuitem" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-destructive hover:bg-destructive/10" onClick={() => { setOpen(false); onLogout(); }}>
                            <LogOut className="size-4" aria-hidden="true" /> Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
