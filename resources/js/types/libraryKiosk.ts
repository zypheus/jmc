export interface LibraryProgramOption {
    id: number;
    program_name: string;
    program_code: string;
}

export interface KioskBookRef {
    title_statement?: string | null;
    barcode?: string | null;
}

export interface KioskReservation {
    id: number;
    status: string;
    reserved_at: string | null;
    expires_at: string;
    book: KioskBookRef | null;
}

export interface KioskBorrowedBook {
    id: number;
    title: string | null | undefined;
    circulation_type: string;
    due_date: string | null | undefined;
    renew_count: number;
    days_overdue: number;
    total_fine: number;
}

export interface KioskReturnedFine {
    id: number;
    title: string | null | undefined;
    returned_date: string | null;
    fine_incurred: number;
    fine_cleared_at: string | null;
    fine_clearance_type: string | null;
}

export interface KioskTransactionRow {
    id: number;
    timestamp_manila: string | null;
    title: string | null | undefined;
    barcode: string | null | undefined;
    status: string;
    history_summary: string;
    due_date: string | null | undefined;
    returned_date: string | null;
    renew_count: number;
    circulation_type: string;
    fine_incurred: number | null;
}

export interface KioskStudentPatron {
    id: number;
    firstname: string;
    lastname: string;
    middle_initial: string | null;
    id_number: string | null;
    email: string | null;
    course: string | null;
    year: string | null;
    birthday: string | null;
    mobile_number: string | null;
    address: string | null;
    emergency_person: string | null;
    emergency_relationship: string | null;
    emergency_number: string | null;
    emergency_address: string | null;
    profile_picture: string | null;
    program_name: string | null | undefined;
    program_id: number | null | undefined;
}

export interface KioskEmployeePatron {
    id: number;
    firstname: string;
    lastname: string;
    middle_initial: string | null;
    employee_id: string | null;
    employee_number: string | null;
    designation: string | null;
    department: string | null;
    program: string | null;
    year_start_work: string | null;
    birth_date: string | null;
    mobile_number: string | null;
    address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_relationship: string | null;
    emergency_contact_number: string | null;
    emergency_address: string | null;
    formal_picture: string | null;
}

export interface KioskCirculationPayload {
    borrowedBooks: KioskBorrowedBook[];
    booksOutCount: number;
    overdueBooksCount: number;
    totalOutstandingFine: number;
    returnedFineHistory: KioskReturnedFine[];
    totalReturnedFinesOutstanding: number;
    bookTransactionHistory: KioskTransactionRow[];
    grandDue: number;
    maxRenewalsPerLoan: number;
    hasPendingEditRequest: boolean;
}

export interface KioskStudentProfileProps extends KioskCirculationPayload {
    patronType: 'student';
    student: KioskStudentPatron;
    programs: LibraryProgramOption[];
    readyReservations: KioskReservation[];
    pendingReservations: KioskReservation[];
}

export interface KioskEmployeeProfileProps extends KioskCirculationPayload {
    patronType: 'employee';
    employee: KioskEmployeePatron;
    programs: LibraryProgramOption[];
    workStartYears: number[];
}

export const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'] as const;

export const CIRCULATION_CHECKOUT = 'checkout';

export const CIRCULATION_ROOM_USE = 'room_use';

export function formatCurrency(amount: number): string {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string | null | undefined): string {
    if (!iso) {
        return '—';
    }

    return new Date(iso).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) {
        return '—';
    }

    return new Date(iso).toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function patronInitials(firstname: string, lastname: string): string {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
}
