import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

import LibraryLayout from '@/Layouts/LibraryLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PageProps, Paginated } from '@/types';

interface StudentSummary {
    id: number;
    firstname: string;
    lastname: string;
    course: string | null;
    year: string | null;
}

interface EditRequestRow {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviewed_at: string | null;
    student: StudentSummary | null;
}

interface PendingRequestsProps extends PageProps {
    pending: Paginated<EditRequestRow>;
    logs: Paginated<EditRequestRow>;
    filters: {
        search: string;
    };
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString();
}

function statusVariant(status: EditRequestRow['status']): 'default' | 'secondary' | 'destructive' {
    if (status === 'approved') {
        return 'secondary';
    }

    if (status === 'rejected') {
        return 'destructive';
    }

    return 'default';
}

function RequestsPagination({
    links,
    activeTab,
}: {
    links: Paginated<unknown>['links'];
    activeTab: 'pending' | 'history';
}) {
    return (
        <div className="mt-4 flex flex-wrap gap-1">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={`${activeTab}-${index}`}
                        href={`${link.url}${link.url.includes('?') ? '&' : '?'}tab=${activeTab}`}
                        className={`rounded border px-3 py-1 text-sm ${
                            link.active ? 'border-primary bg-primary text-primary-foreground' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={`${activeTab}-${index}`}
                        className="px-3 py-1 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}

function RequestsTable({
    requests,
    showActions,
    showReviewedAt,
}: {
    requests: EditRequestRow[];
    showActions: boolean;
    showReviewedAt: boolean;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested At</TableHead>
                    {showReviewedAt && <TableHead>Reviewed At</TableHead>}
                    {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={showActions ? (showReviewedAt ? 7 : 6) : showReviewedAt ? 6 : 5}
                            className="text-center text-muted-foreground"
                        >
                            No requests found.
                        </TableCell>
                    </TableRow>
                ) : (
                    requests.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell>
                                {request.student
                                    ? `${request.student.lastname}, ${request.student.firstname}`
                                    : 'Unknown student'}
                            </TableCell>
                            <TableCell>{request.student?.course ?? '-'}</TableCell>
                            <TableCell>{request.student?.year ?? '-'}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant(request.status)}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                            </TableCell>
                            <TableCell>{formatDate(request.created_at)}</TableCell>
                            {showReviewedAt && <TableCell>{formatDate(request.reviewed_at)}</TableCell>}
                            {showActions && (
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => router.post(`/admin/requests/${request.id}/approve`)}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => router.post(`/admin/requests/${request.id}/reject`)}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}

export default function PendingRequests({ pending, logs, filters }: PendingRequestsProps) {
    const page = usePage();
    const initialTab = useMemo<'pending' | 'history'>(() => {
        const query = page.url.split('?')[1] ?? '';
        const params = new URLSearchParams(query);
        return params.get('tab') === 'history' ? 'history' : 'pending';
    }, [page.url]);

    const [search, setSearch] = useState(filters.search ?? '');
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>(initialTab);

    function submitSearch(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/student/pending-requests',
            {
                search: search || undefined,
                tab: activeTab,
            },
            { preserveState: true },
        );
    }

    return (
        <LibraryLayout>
            <Head title="Pending Student Edit Requests" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Student Edit Requests</h1>
                        <p className="text-sm text-muted-foreground">
                            Review pending profile change requests and request history.
                        </p>
                    </div>
                    <Link href="/students">
                        <Button variant="outline">Back to students</Button>
                    </Link>
                </div>

                <Alert>
                    <AlertTitle>Review Queue</AlertTitle>
                    <AlertDescription>
                        Approving applies the requested profile changes to the student record immediately.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle>Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by student name"
                                className="sm:max-w-sm"
                            />
                            <Button type="submit">Apply</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    router.get(
                                        '/student/pending-requests',
                                        { tab: activeTab },
                                        { preserveState: true },
                                    );
                                }}
                            >
                                Clear
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Tabs
                    value={activeTab}
                    onValueChange={(value) => {
                        const tab = value === 'history' ? 'history' : 'pending';
                        setActiveTab(tab);
                        router.get(
                            '/student/pending-requests',
                            {
                                search: search || undefined,
                                tab,
                            },
                            { preserveState: true },
                        );
                    }}
                >
                    <TabsList>
                        <TabsTrigger value="pending">Pending ({pending.total})</TabsTrigger>
                        <TabsTrigger value="history">History ({logs.total})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                        <Card>
                            <CardContent className="pt-6">
                                <RequestsTable requests={pending.data} showActions showReviewedAt={false} />
                                <RequestsPagination links={pending.links} activeTab="pending" />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history">
                        <Card>
                            <CardContent className="pt-6">
                                <RequestsTable requests={logs.data} showActions={false} showReviewedAt />
                                <RequestsPagination links={logs.links} activeTab="history" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </LibraryLayout>
    );
}
