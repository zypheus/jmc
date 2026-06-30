import { Head, usePage } from '@inertiajs/react';

import BorrowedBooksTable from '@/components/library/kiosk/BorrowedBooksTable';
import PatronFineSummary from '@/components/library/kiosk/PatronFineSummary';
import PatronIdentityCard from '@/components/library/kiosk/PatronIdentityCard';
import PatronSummaryCards from '@/components/library/kiosk/PatronSummaryCards';
import RequestEditDialog from '@/components/library/kiosk/RequestEditDialog';
import ReturnedFinesTable from '@/components/library/kiosk/ReturnedFinesTable';
import TransactionHistoryTable from '@/components/library/kiosk/TransactionHistoryTable';
import KioskShell from '@/Layouts/KioskShell';
import type { PageProps } from '@/types';
import { patronInitials, type KioskEmployeeProfileProps } from '@/types/libraryKiosk';

export default function EmployeeProfile({
    employee,
    programs,
    workStartYears,
    borrowedBooks,
    booksOutCount,
    overdueBooksCount,
    totalOutstandingFine,
    returnedFineHistory,
    totalReturnedFinesOutstanding,
    bookTransactionHistory,
    grandDue,
    maxRenewalsPerLoan,
    hasPendingEditRequest,
}: KioskEmployeeProfileProps) {
    const { flash } = usePage<PageProps>().props;

    const identityLines = [
        `ID ${employee.employee_id ?? employee.employee_number ?? '—'}`,
        employee.designation ?? 'Designation not set',
        [employee.department, employee.program].filter(Boolean).join(' · ') || 'Department not set',
    ];

    return (
        <KioskShell title="Employee library account">
            <Head title={`${employee.firstname} ${employee.lastname}`} />

            <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
                {(flash.success || flash.error) && (
                    <div
                        className={`rounded-2xl px-5 py-4 text-sm ${
                            flash.error
                                ? 'border-red-500/35 bg-red-500/10 text-red-200'
                                : 'kiosk-alert-success text-[var(--jmc-green)]'
                        }`}
                    >
                        {flash.error ?? flash.success}
                    </div>
                )}

                <PatronIdentityCard
                    name={`${employee.firstname} ${employee.lastname}`}
                    lines={identityLines}
                    avatarUrl={employee.formal_picture}
                    initials={patronInitials(employee.firstname, employee.lastname)}
                >
                    <RequestEditDialog
                        patronType="employee"
                        patron={employee}
                        programs={programs}
                        workStartYears={workStartYears}
                        hasPendingEditRequest={hasPendingEditRequest}
                    />
                </PatronIdentityCard>

                <PatronSummaryCards
                    booksOutCount={booksOutCount}
                    overdueBooksCount={overdueBooksCount}
                    totalOutstandingFine={totalOutstandingFine}
                />

                <BorrowedBooksTable books={borrowedBooks} maxRenewalsPerLoan={maxRenewalsPerLoan} />
                <TransactionHistoryTable rows={bookTransactionHistory} />
                <ReturnedFinesTable rows={returnedFineHistory} totalOutstanding={totalReturnedFinesOutstanding} />

                <PatronFineSummary
                    totalOutstandingFine={totalOutstandingFine}
                    totalReturnedFinesOutstanding={totalReturnedFinesOutstanding}
                    grandDue={grandDue}
                    booksOutCount={booksOutCount}
                    overdueBooksCount={overdueBooksCount}
                />
            </div>
        </KioskShell>
    );
}
