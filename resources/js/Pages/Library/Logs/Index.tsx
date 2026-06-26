import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useState } from 'react';

import EmptyState from '@/components/library/EmptyState';
import FilterSidebarCard from '@/components/library/FilterSidebarCard';
import PageHeader from '@/components/library/PageHeader';
import StatusBadge from '@/components/library/StatusBadge';
import PaginationLinks from '@/components/PaginationLinks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated } from '@/types';

interface BookSummary {
    id: number;
    title_statement: string;
    main_author: string | null;
    accession_no: string | null;
}

interface PatronSummary {
    id: number;
    firstname: string;
    lastname: string;
    id_number?: string | null;
    employee_id?: string | null;
}

interface BookLogRow {
    id: number;
    status: string;
    circulation_type: string | null;
    patron_name: string | null;
    timestamp: string | null;
    due_date: string | null;
    returned_date: string | null;
    fine_incurred: string | null;
    book: BookSummary | null;
    student: PatronSummary | null;
    employee: PatronSummary | null;
}

interface PatronSuggestion {
    id: number;
    type: 'student' | 'employee';
    name: string;
}

interface BookSuggestion {
    id: number;
    title: string;
    author: string | null;
    copy_identifier: string;
    copy_identifier_summary: string;
    availability: string | null;
    reserved: boolean;
    last_student_id: number | null;
    last_employee_id: number | null;
    last_patron: string | null;
    reservation_student_id: number | null;
    reservation_student_name: string | null;
}

interface Prefill {
    patronLabel: string;
    studentId: number | null;
    employeeId: number | null;
    copyIdentifier: string;
    copyReserved: boolean;
    status: string;
}

interface LogFilters {
    filter_patron: string;
    book_title: string;
    start_date: string;
    end_date: string;
    circulation_type: string;
    student_id: string | number;
    employee_id: string | number;
}

interface IndexProps extends PageProps {
    logs: Paginated<BookLogRow>;
    prefill: Prefill;
    loanDefaults: { studentDays: number; employeeDays: number };
    filters: LogFilters;
}

function statusTone(status: string) {
    const normalized = status.toLowerCase();
    if (normalized.includes('checked in')) return 'in';
    if (normalized.includes('checked out')) return 'out';
    if (normalized.includes('overdue')) return 'overdue';
    return 'pending';
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return value;
    }
    return d.toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
}

function formatDateOnly(value: string | null): string {
    if (!value) {
        return '—';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return value;
    }
    return d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' });
}

function circulationLabel(log: BookLogRow): string {
    if (log.status === 'Checked In') {
        return log.circulation_type === 'room_use' ? 'Returned (room use)' : 'Returned (check out)';
    }
    return log.circulation_type === 'room_use' ? 'Room use' : 'Check out';
}

export default function Index({ logs, prefill, loanDefaults, filters }: IndexProps) {
    const { flash } = usePage<IndexProps>().props;
    const hasHistoryFilters =
        Boolean(filters.filter_patron) ||
        Boolean(filters.book_title) ||
        Boolean(filters.start_date) ||
        Boolean(filters.end_date) ||
        Boolean(filters.circulation_type);

    const [tab, setTab] = useState<'record' | 'history'>(hasHistoryFilters ? 'history' : 'record');

    const [patronQuery, setPatronQuery] = useState(prefill.patronLabel);
    const [patronSuggestions, setPatronSuggestions] = useState<PatronSuggestion[]>([]);
    const [showPatronSuggestions, setShowPatronSuggestions] = useState(false);

    const [copyQuery, setCopyQuery] = useState(prefill.copyIdentifier);
    const [bookSuggestions, setBookSuggestions] = useState<BookSuggestion[]>([]);
    const [showBookSuggestions, setShowBookSuggestions] = useState(false);
    const [copyReserved, setCopyReserved] = useState(prefill.copyReserved);

    const [filterPatron, setFilterPatron] = useState(filters.filter_patron ?? '');
    const [filterBookTitle, setFilterBookTitle] = useState(filters.book_title ?? '');
    const [filterStartDate, setFilterStartDate] = useState(filters.start_date ?? '');
    const [filterEndDate, setFilterEndDate] = useState(filters.end_date ?? '');
    const [filterCirculationType, setFilterCirculationType] = useState(filters.circulation_type ?? '');

    const { data, setData, post, processing, errors, reset } = useForm({
        copy_identifier: prefill.copyIdentifier,
        status: prefill.status as 'checked_out' | 'room_use' | 'checked_in',
        student_id: prefill.studentId ?? ('' as number | ''),
        employee_id: prefill.employeeId ?? ('' as number | ''),
        loan_duration_days: loanDefaults.studentDays,
        due_date: '',
    });

    const fetchPatronSuggestions = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setPatronSuggestions([]);
            return;
        }
        const res = await fetch(`/patron-suggestions?query=${encodeURIComponent(query)}`, {
            headers: { Accept: 'application/json' },
        });
        if (res.ok) {
            setPatronSuggestions(await res.json());
        }
    }, []);

    const fetchBookSuggestions = useCallback(async (query: string) => {
        if (query.trim().length < 1) {
            setBookSuggestions([]);
            return;
        }
        const res = await fetch(`/book-suggestions?query=${encodeURIComponent(query)}`, {
            headers: { Accept: 'application/json' },
        });
        if (res.ok) {
            setBookSuggestions(await res.json());
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchPatronSuggestions(patronQuery), 250);
        return () => clearTimeout(t);
    }, [patronQuery, fetchPatronSuggestions]);

    useEffect(() => {
        const t = setTimeout(() => fetchBookSuggestions(copyQuery), 250);
        return () => clearTimeout(t);
    }, [copyQuery, fetchBookSuggestions]);

    function selectPatron(suggestion: PatronSuggestion) {
        setPatronQuery(suggestion.name);
        setShowPatronSuggestions(false);
        if (suggestion.type === 'student') {
            setData('student_id', suggestion.id);
            setData('employee_id', '');
            setData('loan_duration_days', loanDefaults.studentDays);
        } else {
            setData('employee_id', suggestion.id);
            setData('student_id', '');
            setData('loan_duration_days', loanDefaults.employeeDays);
        }
    }

    function selectBook(book: BookSuggestion) {
        setCopyQuery(book.copy_identifier);
        setData('copy_identifier', book.copy_identifier);
        setShowBookSuggestions(false);
        setCopyReserved(book.reserved);

        if (book.reserved) {
            setData('status', 'room_use');
        } else if (book.availability === 'Borrowed' && book.last_patron) {
            setData('status', 'checked_in');
            if (book.last_student_id) {
                setData('student_id', book.last_student_id);
                setData('employee_id', '');
            } else if (book.last_employee_id) {
                setData('employee_id', book.last_employee_id);
                setData('student_id', '');
            }
            if (book.last_patron) {
                setPatronQuery(book.last_patron);
            }
        } else if (book.reservation_student_id && book.reservation_student_name) {
            setData('status', 'checked_out');
            setData('student_id', book.reservation_student_id);
            setData('employee_id', '');
            setPatronQuery(book.reservation_student_name);
        } else {
            setData('status', 'checked_out');
        }
    }

    function submitRecord(e: FormEvent) {
        e.preventDefault();
        post('/logs', {
            preserveScroll: true,
            onSuccess: () => {
                reset('copy_identifier', 'due_date');
                setCopyQuery('');
                setPatronQuery('');
                setData('student_id', '');
                setData('employee_id', '');
                setData('status', 'checked_out');
                setCopyReserved(false);
            },
        });
    }

    function applyHistoryFilters(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/logs',
            {
                filter_patron: filterPatron || undefined,
                book_title: filterBookTitle || undefined,
                start_date: filterStartDate || undefined,
                end_date: filterEndDate || undefined,
                circulation_type: filterCirculationType || undefined,
            },
            { preserveState: true },
        );
    }

    function clearHistoryFilters() {
        setFilterPatron('');
        setFilterBookTitle('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterCirculationType('');
        router.get('/logs', {}, { preserveState: true });
    }

    return (
        <LibraryLayout>
            <Head title="Circulation Logs" />

            <div className="space-y-6">
                <PageHeader
                    eyebrow="Library"
                    title="Circulation"
                    description="Record check out, room use, and check in transactions."
                    actions={
                        <Link href="/dashboard/library-admin">
                            <Button variant="outline" size="sm">
                                Back to dashboard
                            </Button>
                        </Link>
                    }
                />

                {flash.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}

                <Tabs value={tab} onValueChange={(value) => setTab(value as 'record' | 'history')}>
                    <TabsList>
                        <TabsTrigger value="record">Record transaction</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="record">
                        <Card>
                            <CardHeader>
                                <CardTitle>Record transaction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitRecord} className="space-y-4">
                                    <div className="relative space-y-2">
                                        <Label htmlFor="copy_identifier">Copy (accession, barcode, or RFID)</Label>
                                        <Input
                                            id="copy_identifier"
                                            value={copyQuery}
                                            onChange={(e) => {
                                                setCopyQuery(e.target.value);
                                                setData('copy_identifier', e.target.value);
                                                setShowBookSuggestions(true);
                                            }}
                                            onFocus={() => setShowBookSuggestions(true)}
                                            autoComplete="off"
                                            required
                                        />
                                        {showBookSuggestions && bookSuggestions.length > 0 && (
                                            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-background shadow-md">
                                                {bookSuggestions.map((book) => (
                                                    <li key={book.id}>
                                                        <button
                                                            type="button"
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                                            onClick={() => selectBook(book)}
                                                        >
                                                            <span className="font-medium">{book.title}</span>
                                                            <span className="block text-xs text-muted-foreground">
                                                                {book.copy_identifier_summary} · {book.availability}
                                                                {book.reserved ? ' · Reserved' : ''}
                                                            </span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {errors.copy_identifier && (
                                            <p className="text-sm text-destructive">{errors.copy_identifier}</p>
                                        )}
                                    </div>

                                    <div className="relative space-y-2">
                                        <Label htmlFor="patron">Patron</Label>
                                        <Input
                                            id="patron"
                                            value={patronQuery}
                                            onChange={(e) => {
                                                setPatronQuery(e.target.value);
                                                setShowPatronSuggestions(true);
                                            }}
                                            onFocus={() => setShowPatronSuggestions(true)}
                                            autoComplete="off"
                                            required
                                        />
                                        {showPatronSuggestions && patronSuggestions.length > 0 && (
                                            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-background shadow-md">
                                                {patronSuggestions.map((s) => (
                                                    <li key={`${s.type}-${s.id}`}>
                                                        <button
                                                            type="button"
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                                            onClick={() => selectPatron(s)}
                                                        >
                                                            {s.name}
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                ({s.type === 'student' ? 'Student' : 'Employee'})
                                                            </span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {(errors.student_id || errors.employee_id) && (
                                            <p className="text-sm text-destructive">Select a patron from the suggestions.</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Transaction type</Label>
                                        <select
                                            id="status"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value as typeof data.status)}
                                        >
                                            <option value="checked_out" disabled={copyReserved}>
                                                Check out (take home)
                                            </option>
                                            <option value="room_use">Room use (in library)</option>
                                            <option value="checked_in">Check in (return)</option>
                                        </select>
                                        {copyReserved && (
                                            <p className="text-xs text-amber-700">
                                                This copy is reserved - only room use is allowed until the hold is cleared.
                                            </p>
                                        )}
                                    </div>

                                    {data.status === 'checked_out' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="loan_duration_days">Loan duration (days)</Label>
                                            <Input
                                                id="loan_duration_days"
                                                type="number"
                                                min={1}
                                                max={365}
                                                value={data.loan_duration_days}
                                                onChange={(e) =>
                                                    setData('loan_duration_days', parseInt(e.target.value, 10) || 1)
                                                }
                                            />
                                        </div>
                                    )}

                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving…' : 'Submit'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history">
                        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
                            <FilterSidebarCard title="Filter history">
                                <form onSubmit={applyHistoryFilters} className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="filter_patron">Patron</Label>
                                        <Input
                                            id="filter_patron"
                                            value={filterPatron}
                                            onChange={(e) => setFilterPatron(e.target.value)}
                                            placeholder="Name or ID"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="filter_book_title">Book title</Label>
                                        <Input
                                            id="filter_book_title"
                                            value={filterBookTitle}
                                            onChange={(e) => setFilterBookTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="filter_circulation_type">Type</Label>
                                        <select
                                            id="filter_circulation_type"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={filterCirculationType}
                                            onChange={(e) => setFilterCirculationType(e.target.value)}
                                        >
                                            <option value="">All</option>
                                            <option value="checkout">Check out</option>
                                            <option value="room_use">Room use</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="filter_start_date">From</Label>
                                        <Input
                                            id="filter_start_date"
                                            type="date"
                                            value={filterStartDate}
                                            onChange={(e) => setFilterStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="filter_end_date">To</Label>
                                        <Input
                                            id="filter_end_date"
                                            type="date"
                                            value={filterEndDate}
                                            onChange={(e) => setFilterEndDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Button type="submit" size="sm">
                                            Apply
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={clearHistoryFilters}>
                                            Clear
                                        </Button>
                                    </div>
                                </form>
                            </FilterSidebarCard>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Transaction history</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {logs.data.length === 0 ? (
                                        <EmptyState
                                            title="No transactions found"
                                            description="Try adjusting filters to see matching circulation activity."
                                        />
                                    ) : (
                                        <>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Book</TableHead>
                                                        <TableHead>Patron</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>When</TableHead>
                                                        <TableHead>Due</TableHead>
                                                        <TableHead>Fine</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {logs.data.map((log) => (
                                                        <TableRow key={log.id}>
                                                            <TableCell>
                                                                {log.book?.title_statement ?? '—'}
                                                                {log.book?.accession_no && (
                                                                    <span className="block text-xs text-muted-foreground">
                                                                        {log.book.accession_no}
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{log.patron_name ?? '—'}</TableCell>
                                                            <TableCell>{circulationLabel(log)}</TableCell>
                                                            <TableCell>
                                                                <StatusBadge tone={statusTone(log.status)}>
                                                                    {log.status}
                                                                </StatusBadge>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                {formatDate(log.timestamp)}
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                {formatDateOnly(log.due_date)}
                                                            </TableCell>
                                                            <TableCell>{log.fine_incurred ? `₱${log.fine_incurred}` : '—'}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            <PaginationLinks links={logs.links} />
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </LibraryLayout>
    );
}
