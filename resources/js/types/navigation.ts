import type { LucideIcon } from 'lucide-react';

export type AppModule = 'attendance' | 'library' | 'super-admin';

export interface NavigationBadge {
    label: string | number;
    tone?: 'neutral' | 'warning' | 'danger';
}

export type NavigationBadgeKey = 'pendingPatrons' | 'pendingRooms' | 'outstandingFines';
export type NavigationMode = 'inertia' | 'document' | 'new-tab';

export interface NavigationItem {
    id: string;
    label: string;
    icon: LucideIcon;
    bootstrapIcon?: string;
    routeName?: string;
    routePrefixes?: string[];
    routeExclusions?: string[];
    href?: string;
    external?: boolean;
    navigationMode?: NavigationMode;
    keywords?: string[];
    badgeKey?: NavigationBadgeKey;
    badgeTone?: NavigationBadge['tone'];
    roles?: string[];
    permissions?: string[];
    badge?: NavigationBadge;
    children?: NavigationItem[];
}

export interface NavigationGroup {
    id: string;
    label?: string;
    items: NavigationItem[];
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
    current?: boolean;
}
