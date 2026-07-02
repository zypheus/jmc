import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminActivityPayload } from '@/types';

export default function NotificationMenu({ payload }: { payload?: AdminActivityPayload | null }) {
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(payload?.unreadCount ?? 0);
    const [activities, setActivities] = useState(payload?.activities ?? []);

    useEffect(() => {
        setUnreadCount(payload?.unreadCount ?? 0);
        setActivities(payload?.activities ?? []);
    }, [payload]);

    useEffect(() => {
        if (!payload?.urls.recent) return;
        const fetchRecent = () => fetch(payload.urls.recent as string, {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        }).then((response) => response.ok ? response.json() : null)
            .then((result) => {
                if (!result) return;
                setUnreadCount(result.unread_count ?? 0);
                setActivities((result.activities ?? []).slice(0, 8));
            }).catch(() => undefined);
        fetchRecent();
        const timer = window.setInterval(fetchRecent, 60000);
        return () => window.clearInterval(timer);
    }, [payload?.urls.recent]);

    const markSeen = async () => {
        if (!payload?.urls.markSeen) return;
        try {
            await fetch(payload.urls.markSeen, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '',
                },
                credentials: 'same-origin',
            });
            setUnreadCount(0);
            setActivities((items) => items.map((item) => ({ ...item, is_unread: false })));
        } catch {
            // Notifications remain usable if marking them as seen fails.
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (nextOpen) void markSeen();
        }}>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground"
                    aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                >
                    <Bell className="size-5" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <span className="absolute right-0 top-0 min-w-4 rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))]">
                <DropdownMenuLabel className="font-normal">
                    <div className="px-0.5 py-1">
                        <p className="font-display text-sm font-semibold">Notifications</p>
                        <p className="text-xs text-muted-foreground">Recent activity for this workspace</p>
                    </div>
                </DropdownMenuLabel>
                <div className="max-h-80 overflow-y-auto">
                    {activities.length ? activities.map((activity) => (
                        <DropdownMenuItem key={activity.id} asChild className="items-start">
                            <Link
                                href={activity.action_url || '#'}
                                className={cn('block', activity.is_unread && 'bg-muted')}
                            >
                                <p className="font-medium">{activity.title}</p>
                                {activity.body && <p className="line-clamp-2 text-xs text-muted-foreground">{activity.body}</p>}
                                {activity.created_at && <p className="mt-1 text-[11px] text-muted-foreground">{activity.created_at}</p>}
                            </Link>
                        </DropdownMenuItem>
                    )) : <p className="px-2 py-6 text-center text-sm text-muted-foreground">No recent notifications.</p>}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
