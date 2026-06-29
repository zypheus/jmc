import type { AdminNavigationItem } from '@/config/libraryNavigation';

export const attendanceNavigation: AdminNavigationItem[] = [
    {
        label: 'Home',
        href: '/dashboard',
        routePrefix: 'attendance.dashboard.',
        icon: 'Home',
    },
    {
        label: 'Attendance',
        icon: 'ClipboardCheck',
        children: [
            { label: 'Kiosk', href: '/attendance', routeName: 'attendance.scan' },
            { label: 'Pending', href: '/attendance/pending', routeName: 'attendance.pending.index' },
            { label: 'Students', href: '/attendance/students', routeName: 'attendance.students.index' },
            { label: 'Employees', href: '/attendance/employees', routeName: 'attendance.employees.index' },
            { label: 'Logs', href: '/attendance/logs', routeName: 'attendance.logs.index', adminOnly: true },
            { label: 'Reports', href: '/attendance/logs/reports', routePrefix: 'attendance.logs.reports.', adminOnly: true },
            { label: 'Gate Feedback', href: '/attendance/feedbacks', routeName: 'attendance.feedback.index', adminOnly: true },
            { label: 'Settings', href: '/attendance/section-picker', routePrefix: 'attendance.section.' },
            { label: 'SMS Blast', href: '/attendance/sms-blast', routePrefix: 'attendance.sms.' },
        ],
    },
];
