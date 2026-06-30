import { Head, usePage } from '@inertiajs/react';

import BorrowedBooksTable from '@/components/library/kiosk/BorrowedBooksTable';
import PatronFineSummary from '@/components/library/kiosk/PatronFineSummary';
import PatronIdentityCard from '@/components/library/kiosk/PatronIdentityCard';
import PatronSummaryCards from '@/components/library/kiosk/PatronSummaryCards';
import RequestEditDialog from '@/components/library/kiosk/RequestEditDialog';
import ReservationAlerts from '@/components/library/kiosk/ReservationAlerts';
import ReturnedFinesTable from '@/components/library/kiosk/ReturnedFinesTable';
import TransactionHistoryTable from '@/components/library/kiosk/TransactionHistoryTable';
import KioskShell from '@/Layouts/KioskShell';
import type { PageProps } from '@/types';
import { patronInitials, type KioskStudentProfileProps } from '@/types/libraryKiosk';

export default function StudentProfile({
    student,
    programs,
    readyReservations,
    pendingReservations,
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
}: KioskStudentProfileProps) {
    const { flash } = usePage<PageProps>().props;

    const identityLines = [
        `ID ${student.id_number ?? '—'}`,
        student.program_name ?? 'Program not set',
        student.year ?? 'Year level not set',
        ...(student.email ? [student.email] : []),
    ];

    return (
        <KioskShell title="Student library account">
            <Head title={`${student.firstname} ${student.lastname}`} />

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
                    name={`${student.firstname} ${student.lastname}`}
                    lines={identityLines}
                    avatarUrl={student.profile_picture}
                    initials={patronInitials(student.firstname, student.lastname)}
                >
                    <RequestEditDialog
                        patronType="student"
                        patron={student}
                        programs={programs}
                        hasPendingEditRequest={hasPendingEditRequest}
                    />
                </PatronIdentityCard>

                <ReservationAlerts
                    ready={readyReservations}
                    pending={pendingReservations}
                    hasEmail={Boolean(student.email)}
                />

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
