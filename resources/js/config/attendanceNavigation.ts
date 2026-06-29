import {
    ClipboardCheck,
    Database,
    Home,
    MessageSquareMore,
    Send,
    Shield,
} from 'lucide-react';

import { dashboardRouteFor } from '@/config/modules';
import type { PageProps } from '@/types';
import type { NavigationGroup } from '@/types/navigation';

const adminRoles = ['attendance_admin'];

export function attendanceNavigation(auth: PageProps['auth']): NavigationGroup[] {
    return [
        {
            id: 'menu',
            label: 'Menu',
            items: [
                {
                    id: 'home',
                    label: 'Home',
                    icon: Home,
                    bootstrapIcon: 'house-door',
                    routeName: dashboardRouteFor('attendance', auth),
                    routePrefixes: ['attendance.dashboard.'],
                },
                {
                    id: 'attendance',
                    label: 'Attendance',
                    icon: ClipboardCheck,
                    bootstrapIcon: 'clipboard-check',
                    children: [
                        {
                            id: 'attendance-kiosk',
                            label: 'Attendance',
                            icon: ClipboardCheck,
                            bootstrapIcon: 'clipboard-check',
                            routeName: 'attendance.scan',
                            external: true,
                        },
                        {
                            id: 'attendance-logs',
                            label: 'Attendance Logs',
                            icon: ClipboardCheck,
                            bootstrapIcon: 'clipboard-check',
                            routeName: 'attendance.logs.index',
                            routePrefixes: ['attendance.logs.'],
                            roles: adminRoles,
                        },
                        {
                            id: 'manage-video',
                            label: 'Manage Video',
                            icon: ClipboardCheck,
                            bootstrapIcon: 'camera-video',
                            routeName: 'attendance.changeVideo',
                            routePrefixes: ['attendance.uploadVideo'],
                        },
                        {
                            id: 'section-picker',
                            label: 'Section Picker',
                            icon: ClipboardCheck,
                            bootstrapIcon: 'list-ul',
                            routeName: 'attendance.section.settings',
                            routePrefixes: ['attendance.section.'],
                        },
                        {
                            id: 'logout-feedback',
                            label: 'Logout Feedback',
                            icon: ClipboardCheck,
                            bootstrapIcon: 'chat-square-text',
                            routeName: 'attendance.feedback.settings',
                            routePrefixes: ['attendance.feedback.settings'],
                        },
                    ],
                },
                {
                    id: 'data',
                    label: 'Data',
                    icon: Database,
                    bootstrapIcon: 'database',
                    children: [
                        {
                            id: 'students',
                            label: 'Students',
                            icon: Database,
                            bootstrapIcon: 'database',
                            routeName: 'attendance.students.index',
                            routePrefixes: ['attendance.students.'],
                        },
                        {
                            id: 'employees',
                            label: 'Employees',
                            icon: Database,
                            bootstrapIcon: 'database',
                            routeName: 'attendance.employees.index',
                            routePrefixes: ['attendance.employees.'],
                        },
                    ],
                },
                {
                    id: 'communication',
                    label: 'Communication',
                    icon: MessageSquareMore,
                    bootstrapIcon: 'chat-dots',
                    children: [
                        {
                            id: 'feedback',
                            label: 'Feedback',
                            icon: MessageSquareMore,
                            bootstrapIcon: 'chat-dots',
                            routeName: 'attendance.feedback.index',
                            routePrefixes: ['attendance.feedback.'],
                            roles: adminRoles,
                        },
                        {
                            id: 'sms-blast',
                            label: 'SMS blast',
                            icon: Send,
                            bootstrapIcon: 'send',
                            routeName: 'attendance.sms.page',
                            routePrefixes: ['attendance.sms.page', 'attendance.sms.send'],
                        },
                        {
                            id: 'scanner-message',
                            label: 'Scanner message',
                            icon: MessageSquareMore,
                            bootstrapIcon: 'chat-left-text',
                            routeName: 'attendance.sms.scanMessage',
                            routePrefixes: ['attendance.sms.scanMessage'],
                        },
                    ],
                },
                {
                    id: 'admin',
                    label: 'Admin',
                    icon: Shield,
                    bootstrapIcon: 'shield-lock',
                    roles: adminRoles,
                    children: [
                        {
                            id: 'create-account',
                            label: 'Create Account',
                            icon: Shield,
                            bootstrapIcon: 'person-plus',
                            routeName: 'staff-users.create',
                            roles: adminRoles,
                        },
                        {
                            id: 'view-accounts',
                            label: 'View Accounts',
                            icon: Shield,
                            bootstrapIcon: 'people',
                            routeName: 'staff-users.index',
                            routePrefixes: ['staff-users.'],
                            roles: adminRoles,
                        },
                    ],
                },
            ],
        },
    ];
}
