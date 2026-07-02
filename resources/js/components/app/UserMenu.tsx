import { Link } from '@inertiajs/react';
import { ChevronDown, LogOut, Settings, Shuffle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import RoleBadge from '@/components/app/RoleBadge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    const user = auth.user;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" className="h-10 gap-1 rounded-full px-1.5" aria-label="Open user menu">
                    <UserAvatar auth={auth} />
                    <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="font-normal">
                    <div className="px-0.5 py-1">
                        <p className="truncate font-display text-sm font-semibold">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {user?.roles.map((role) => <RoleBadge key={role} role={role} />)}
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={route('account.edit')}>
                            <Settings className="size-4" aria-hidden="true" /> My Account
                    </Link>
                </DropdownMenuItem>
                {auth.availableModules.length > 1 && (
                    <DropdownMenuItem asChild>
                        <Link href={route('module.select')}>
                                <Shuffle className="size-4" aria-hidden="true" /> Switch Module
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={onLogout}>
                    <LogOut className="size-4" aria-hidden="true" /> Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
