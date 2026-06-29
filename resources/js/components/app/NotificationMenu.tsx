import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AdminActivityPayload } from '@/types';

export default function NotificationMenu({ payload }: { payload?: AdminActivityPayload | null }) {
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(payload?.unreadCount ?? 0);
    const [activities, setActivities] = useState(payload?.activities ?? []);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setUnreadCount(payload?.unreadCount ?? 0);
        setActivities(payload?.activities ?? []);
    }, [payload]);

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
        <div className="relative" ref={rootRef}>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground"
                aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={async () => {
                    const nextOpen = !open;
                    setOpen(nextOpen);
                    if (nextOpen) await markSeen();
                }}
            >
                <Bell className="size-5" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 min-w-4 rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Button>
            {open && (
                <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border bg-popover p-2 shadow-lg" role="menu">
                    <div className="border-b px-2 pb-2">
                        <p className="font-display text-sm font-semibold">Notifications</p>
                        <p className="text-xs text-muted-foreground">Recent activity for this workspace</p>
                    </div>
                    <div className="max-h-80 space-y-1 overflow-y-auto pt-1">
                        {activities.length ? activities.map((activity) => (
                            <Link
                                key={activity.id}
                                href={activity.action_url || '#'}
                                role="menuitem"
                                className={cn('block rounded-lg px-2.5 py-2 text-sm hover:bg-muted', activity.is_unread && 'bg-muted')}
                                onClick={() => setOpen(false)}
                            >
                                <p className="font-medium">{activity.title}</p>
                                {activity.body && <p className="line-clamp-2 text-xs text-muted-foreground">{activity.body}</p>}
                                {activity.created_at && <p className="mt-1 text-[11px] text-muted-foreground">{activity.created_at}</p>}
                            </Link>
                        )) : <p className="px-2 py-6 text-center text-sm text-muted-foreground">No recent notifications.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
