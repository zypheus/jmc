export interface AuthUser {
    id: number;
    name: string;
    fname: string;
    lname: string;
    fullName: string;
    email: string;
    roles: string[];
    permissions: string[];
    role: string | null;
    isAdmin: boolean;
    initials: string;
    avatarUrl: string | null;
}

export interface AdminActivityItem {
    id: number;
    title: string;
    body: string | null;
    action_url: string | null;
    created_at: string | null;
    is_unread: boolean;
}

export interface AdminActivityPayload {
    unreadCount: number;
    activities: AdminActivityItem[];
    urls: {
        markSeen?: string;
        recent?: string;
    };
}

export interface PageProps {
    auth: {
        user: AuthUser | null;
        availableModules: Array<'attendance' | 'library'>;
        activeModule: 'attendance' | 'library' | 'super-admin' | null;
        isSuperAdmin: boolean;
    };
    routeName?: string | null;
    adminActivity?: AdminActivityPayload | null;
    flash: {
        success?: string | null;
        error?: string | null;
        lookup_status?: string | null;
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
    isActive: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
