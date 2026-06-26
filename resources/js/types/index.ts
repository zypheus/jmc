export interface AuthUser {
    id: number;
    fname: string;
    lname: string;
    fullName: string;
    email: string;
    roles: string[];
}

export interface PageProps {
    auth: {
        user: AuthUser | null;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
    branding: {
        blue: string;
        green: string;
        gold: string;
    };
    [key: string]: unknown;
}

export interface LibraryDashboardStats {
    studentsCount: number;
    employeesCount: number;
    booksCount: number;
    pendingCount: number;
    outstandingFinesCount: number;
    activeLoansCount: number;
}

export interface AttendanceDashboardStats {
    studentsCount: number;
    employeesCount: number;
    todayInCount: number;
    pendingRegistrationsCount: number;
    logsThisWeekCount: number;
}

export interface StaffUser {
    id: number;
    fname: string;
    lname: string;
    fullName: string;
    email: string;
    roles: string[];
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
