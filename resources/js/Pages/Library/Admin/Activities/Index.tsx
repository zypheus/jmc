import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

import EmptyState from '@/components/library/EmptyState';
import FilterSidebarCard from '@/components/library/FilterSidebarCard';
import PageHeader from '@/components/library/PageHeader';
import PaginationLinks from '@/components/PaginationLinks';
import StatusBadge from '@/components/library/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface ActivityUser {
    id: number;
    fullName?: string;
    fname?: string;
    lname?: string;
}

interface ActivityRow {
    id: number;
    type: string;
    title: string;
    body: string | null;
    action_url: string | null;
    created_at: string | null;
    user: ActivityUser | null;
}

interface ActivitiesIndexProps extends PageProps {
    activities: Paginated<ActivityRow>;
    category: 'patron' | 'library_staff';
    dateFrom: string | null;
    dateTo: string | null;
}

const categoryLabel: Record<'patron' | 'library_staff', string> = {
    patron: 'Patron notifications',
    library_staff: 'Staff activity',
};

function userLabel(user: ActivityUser | null) {
    if (!user) {
        return null;
    }
    if (user.fullName) {
        return user.fullName;
    }
    return [user.fname, user.lname].filter(Boolean).join(' ').trim() || null;
}

function formatDate(value: string | null) {
    if (!value) {
        return '—';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
}

export default function Index({ activities, category, dateFrom, dateTo }: ActivitiesIndexProps) {
    const [localDateFrom, setLocalDateFrom] = useState(dateFrom ?? '');
    const [localDateTo, setLocalDateTo] = useState(dateTo ?? '');

    const filterParams = useMemo(
        () => ({
            category,
            date_from: localDateFrom || undefined,
            date_to: localDateTo || undefined,
        }),
        [category, localDateFrom, localDateTo],
    );

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get('/admin/activities', filterParams, { preserveState: true });
    };

    const clearDates = () => {
        setLocalDateFrom('');
        setLocalDateTo('');
        router.get('/admin/activities', { category }, { preserveState: true });
    };

    return (
        <LibraryLayout>
            <Head title="Activity Feed" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Reports"
                    title="Activity log"
                    description="Patron notifications and staff actions in one feed."
                    actions={
                        <Link href="/books">
                            <Button variant="outline" size="sm">
                                Catalog
                            </Button>
                        </Link>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
                    <FilterSidebarCard title="Filter dates">
                        <form className="space-y-3" onSubmit={applyFilters}>
                            <div className="space-y-2">
                                <label htmlFor="date_from" className="text-sm font-medium">
                                    From
                                </label>
                                <input
                                    id="date_from"
                                    type="date"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={localDateFrom}
                                    onChange={(event) => setLocalDateFrom(event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="date_to" className="text-sm font-medium">
                                    To
                                </label>
                                <input
                                    id="date_to"
                                    type="date"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={localDateTo}
                                    onChange={(event) => setLocalDateTo(event.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button type="submit" size="sm">
                                    Apply
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={clearDates}>
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </FilterSidebarCard>

                    <Card>
                        <CardHeader className="space-y-3">
                            <CardTitle>{categoryLabel[category]}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant={category === 'patron' ? 'default' : 'outline'}
                                    onClick={() =>
                                        router.get('/admin/activities', {
                                            category: 'patron',
                                            date_from: localDateFrom || undefined,
                                            date_to: localDateTo || undefined,
                                        })
                                    }
                                >
                                    Patron notifications
                                </Button>
                                <Button
                                    size="sm"
                                    variant={category === 'library_staff' ? 'default' : 'outline'}
                                    onClick={() =>
                                        router.get('/admin/activities', {
                                            category: 'library_staff',
                                            date_from: localDateFrom || undefined,
                                            date_to: localDateTo || undefined,
                                        })
                                    }
                                >
                                    Staff activity
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {activities.data.length === 0 ? (
                                <EmptyState
                                    title={
                                        category === 'patron'
                                            ? 'No patron notifications for this period'
                                            : 'No staff activity for this period'
                                    }
                                    description="Try widening the date range."
                                />
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {activities.data.map((activity) => (
                                            <div key={activity.id} className="rounded-md border p-4">
                                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                    <StatusBadge tone="pending">
                                                        {activity.type.replaceAll('_', ' ')}
                                                    </StatusBadge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(activity.created_at)}
                                                    </span>
                                                </div>
                                                <p className="font-medium">{activity.title}</p>
                                                {activity.body && (
                                                    <p className="mt-1 text-sm text-muted-foreground">{activity.body}</p>
                                                )}
                                                {activity.user && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        By {userLabel(activity.user)}
                                                    </p>
                                                )}
                                                {activity.action_url && (
                                                    <div className="mt-3">
                                                        <a href={activity.action_url}>
                                                            <Button variant="outline" size="sm">
                                                                Open
                                                            </Button>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <PaginationLinks links={activities.links} />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </LibraryLayout>
    );
}
