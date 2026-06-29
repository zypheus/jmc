import type { PageProps } from '@/types';
import type { AppModule, NavigationGroup, NavigationItem } from '@/types/navigation';

export function hasRole(auth: PageProps['auth'], role: string): boolean {
    return auth.user?.roles.includes(role) ?? false;
}

export function hasAnyRole(auth: PageProps['auth'], roles: string[]): boolean {
    return roles.some((role) => hasRole(auth, role));
}

export function hasPermission(auth: PageProps['auth'], permission: string): boolean {
    return auth.user?.permissions.includes(permission) ?? false;
}

export function hasAnyPermission(auth: PageProps['auth'], permissions: string[]): boolean {
    return permissions.some((permission) => hasPermission(auth, permission));
}

export function canAccessNavigationItem(
    item: NavigationItem,
    auth: PageProps['auth'],
    module: AppModule,
): boolean {
    if (item.routeName && !route().has(item.routeName)) {
        return false;
    }

    if (!auth.isSuperAdmin && item.roles?.length && !hasAnyRole(auth, item.roles)) {
        return false;
    }

    if (!auth.isSuperAdmin && item.permissions?.length && !hasAnyPermission(auth, item.permissions)) {
        return false;
    }

    if (module === 'super-admin' && !auth.isSuperAdmin) {
        return false;
    }

    return true;
}

export function filterNavigation(
    groups: NavigationGroup[],
    auth: PageProps['auth'],
    module: AppModule,
): NavigationGroup[] {
    return groups
        .map((group) => ({
            ...group,
            items: group.items
                .filter((item) => canAccessNavigationItem(item, auth, module))
                .map((item) => ({
                    ...item,
                    children: item.children?.filter((child) => canAccessNavigationItem(child, auth, module)),
                }))
                .filter((item) => !item.children || item.children.length > 0),
        }))
        .filter((group) => group.items.length > 0);
}

export function roleLabel(role: string): string {
    const labels: Record<string, string> = {
        super_admin: 'Super Administrator',
        attendance_admin: 'Attendance Administrator',
        attendance_staff: 'Attendance Staff',
        library_admin: 'Library Administrator',
        library_staff: 'Library Staff',
    };

    return labels[role] ?? role.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function activeModuleRole(auth: PageProps['auth'], module: AppModule): string {
    if (module === 'super-admin') {
        return 'Super Administrator';
    }

    const preferred = module === 'attendance'
        ? ['attendance_admin', 'attendance_staff']
        : ['library_admin', 'library_staff'];

    const role = preferred.find((candidate) => auth.user?.roles.includes(candidate));
    return role ? roleLabel(role) : roleLabel(auth.user?.roles[0] ?? 'Staff');
}
