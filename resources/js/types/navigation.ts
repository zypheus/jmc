import type { LucideIcon } from 'lucide-react';

export type AppModule = 'attendance' | 'library' | 'super-admin';

export interface NavigationBadge {
    label: string | number;
    tone?: 'neutral' | 'warning' | 'danger';
}

export interface NavigationItem {
    id: string;
    label: string;
    icon: LucideIcon;
    bootstrapIcon?: string;
    routeName?: string;
    routePrefixes?: string[];
    href?: string;
    external?: boolean;
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
