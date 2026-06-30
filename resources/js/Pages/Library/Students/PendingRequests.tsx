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

interface EmployeeSummary {
    id: number;
    firstname: string;
    lastname: string;
    designation: string | null;
    program: string | null;
}

interface StudentEditRequestRow {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviewed_at: string | null;
    student: StudentSummary | null;
}

interface EmployeeEditRequestRow {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviewed_at: string | null;
    employee: EmployeeSummary | null;
}

interface PendingRequestsProps extends PageProps {
    pending: Paginated<StudentEditRequestRow>;
    logs: Paginated<StudentEditRequestRow>;
    employeePending: Paginated<EmployeeEditRequestRow>;
    employeeLogs: Paginated<EmployeeEditRequestRow>;
    filters: {
        search: string;
    };
}

type QueueTab = 'pending' | 'history';
type PatronTab = 'students' | 'employees';

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString();
}

function statusVariant(status: 'pending' | 'approved' | 'rejected'): 'default' | 'secondary' | 'destructive' {
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
    patronTab,
    queueTab,
}: {
    links: Paginated<unknown>['links'];
    patronTab: PatronTab;
    queueTab: QueueTab;
}) {
    return (
        <div className="mt-4 flex flex-wrap gap-1">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={`${patronTab}-${queueTab}-${index}`}
                        href={`${link.url}${link.url.includes('?') ? '&' : '?'}patron=${patronTab}&tab=${queueTab}`}
                        className={`rounded border px-3 py-1 text-sm ${
                            link.active ? 'border-primary bg-primary text-primary-foreground' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={`${patronTab}-${queueTab}-${index}`}
                        className="px-3 py-1 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}

function StudentRequestsTable({
    requests,
    showActions,
    showReviewedAt,
}: {
    requests: StudentEditRequestRow[];
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

function EmployeeRequestsTable({
    requests,
    showActions,
    showReviewedAt,
}: {
    requests: EmployeeEditRequestRow[];
    showActions: boolean;
    showReviewedAt: boolean;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Program</TableHead>
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
                                {request.employee
                                    ? `${request.employee.lastname}, ${request.employee.firstname}`
                                    : 'Unknown employee'}
                            </TableCell>
                            <TableCell>{request.employee?.designation ?? '-'}</TableCell>
                            <TableCell>{request.employee?.program ?? '-'}</TableCell>
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
                                            onClick={() =>
                                                router.post(`/admin/employee-requests/${request.id}/approve`)
                                            }
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                router.post(`/admin/employee-requests/${request.id}/reject`)
                                            }
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

export default function PendingRequests({
    pending,
    logs,
    employeePending,
    employeeLogs,
    filters,
}: PendingRequestsProps) {
    const page = usePage();
    const { patronTab, queueTab } = useMemo(() => {
        const query = page.url.split('?')[1] ?? '';
        const params = new URLSearchParams(query);

        return {
            patronTab: params.get('patron') === 'employees' ? ('employees' as PatronTab) : ('students' as PatronTab),
            queueTab: params.get('tab') === 'history' ? ('history' as QueueTab) : ('pending' as QueueTab),
        };
    }, [page.url]);

    const [search, setSearch] = useState(filters.search ?? '');
    const [activePatronTab, setActivePatronTab] = useState<PatronTab>(patronTab);
    const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>(queueTab);

    function navigate(nextPatron: PatronTab, nextQueue: QueueTab) {
        router.get(
            '/student/pending-requests',
            {
                search: search || undefined,
                patron: nextPatron,
                tab: nextQueue,
            },
            { preserveState: true },
        );
    }

    function submitSearch(event: FormEvent) {
        event.preventDefault();
        navigate(activePatronTab, activeQueueTab);
    }

    const pendingData = activePatronTab === 'students' ? pending : employeePending;
    const historyData = activePatronTab === 'students' ? logs : employeeLogs;

    return (
        <LibraryLayout>
            <Head title="Patron Edit Requests" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Patron Edit Requests</h1>
                        <p className="text-sm text-muted-foreground">
                            Review pending profile change requests from library kiosk patrons.
                        </p>
                    </div>
                    <Link href="/students">
                        <Button variant="outline">Back to students</Button>
                    </Link>
                </div>

                <Alert>
                    <AlertTitle>Review queue</AlertTitle>
                    <AlertDescription>
                        Approving applies the requested profile changes to the patron record immediately.
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
                                placeholder="Search by patron name"
                                className="sm:max-w-sm"
                            />
                            <Button type="submit">Apply</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    router.get('/student/pending-requests', {
                                        patron: activePatronTab,
                                        tab: activeQueueTab,
                                    });
                                }}
                            >
                                Clear
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Tabs
                    value={activePatronTab}
                    onValueChange={(value) => {
                        const nextPatron = value === 'employees' ? 'employees' : 'students';
                        setActivePatronTab(nextPatron);
                        navigate(nextPatron, activeQueueTab);
                    }}
                >
                    <TabsList>
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="employees">Employees</TabsTrigger>
                    </TabsList>

                    <Tabs
                        className="mt-4"
                        value={activeQueueTab}
                        onValueChange={(value) => {
                            const nextQueue = value === 'history' ? 'history' : 'pending';
                            setActiveQueueTab(nextQueue);
                            navigate(activePatronTab, nextQueue);
                        }}
                    >
                        <TabsList>
                            <TabsTrigger value="pending">Pending ({pendingData.total})</TabsTrigger>
                            <TabsTrigger value="history">History ({historyData.total})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending">
                            <Card>
                                <CardContent className="pt-6">
                                    {activePatronTab === 'students' ? (
                                        <StudentRequestsTable
                                            requests={pending.data}
                                            showActions
                                            showReviewedAt={false}
                                        />
                                    ) : (
                                        <EmployeeRequestsTable
                                            requests={employeePending.data}
                                            showActions
                                            showReviewedAt={false}
                                        />
                                    )}
                                    <RequestsPagination
                                        links={pendingData.links}
                                        patronTab={activePatronTab}
                                        queueTab="pending"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card>
                                <CardContent className="pt-6">
                                    {activePatronTab === 'students' ? (
                                        <StudentRequestsTable
                                            requests={logs.data}
                                            showActions={false}
                                            showReviewedAt
                                        />
                                    ) : (
                                        <EmployeeRequestsTable
                                            requests={employeeLogs.data}
                                            showActions={false}
                                            showReviewedAt
                                        />
                                    )}
                                    <RequestsPagination
                                        links={historyData.links}
                                        patronTab={activePatronTab}
                                        queueTab="history"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </Tabs>
            </div>
        </LibraryLayout>
    );
}
