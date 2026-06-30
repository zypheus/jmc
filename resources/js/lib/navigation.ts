import type { PageProps } from '@/types';
import type { AppModule, BreadcrumbItem, NavigationGroup, NavigationItem, NavigationMode } from '@/types/navigation';
import { dashboardRouteFor, moduleDefinitions } from '@/config/modules';

export function navigationHref(item: NavigationItem): string {
    if (item.routeName && route().has(item.routeName)) {
        return route(item.routeName);
    }

    return item.href ?? '#';
}

export function navigationMode(item: NavigationItem): NavigationMode {
    if (item.navigationMode) {
        return item.navigationMode;
    }

    return item.external ? 'new-tab' : 'inertia';
}

export function hasNavigationDestination(item: NavigationItem): boolean {
    return Boolean((item.routeName && route().has(item.routeName)) || item.href);
}

export function isNavigationItemActive(item: NavigationItem, routeName?: string | null): boolean {
    if (!routeName) {
        return false;
    }

    if (item.routeExclusions?.some((excluded) => routeName.startsWith(excluded))) {
        return false;
    }

    if (item.routeName === routeName) {
        return true;
    }

    return item.routePrefixes?.some((prefix) => routeName.startsWith(prefix)) ?? false;
}

export function isNavigationBranchActive(item: NavigationItem, routeName?: string | null): boolean {
    return isNavigationItemActive(item, routeName)
        || item.children?.some((child) => isNavigationItemActive(child, routeName)) === true;
}

function actionLabel(routeName?: string | null): string | null {
    const action = routeName?.split('.').at(-1);
    const labels: Record<string, string> = {
        create: 'Add',
        edit: 'Edit',
        show: 'Details',
        archived: 'Archived',
        trash: 'Trash',
    };

    return action ? labels[action] ?? null : null;
}

export function resolveBreadcrumbs(
    groups: NavigationGroup[],
    module: AppModule,
    auth: PageProps['auth'],
    routeName?: string | null,
): BreadcrumbItem[] {
    const dashboardHref = route(dashboardRouteFor(module, auth));
    const crumbs: BreadcrumbItem[] = [{ label: moduleDefinitions[module].shortLabel, href: dashboardHref }];

    for (const group of groups) {
        for (const item of group.items) {
            const activeChild = item.children?.find((child) => isNavigationItemActive(child, routeName));
            if (activeChild) {
                crumbs.push({
                    label: item.label,
                    href: hasNavigationDestination(item) ? navigationHref(item) : undefined,
                });
                crumbs.push({ label: activeChild.label, current: true });
                const action = actionLabel(routeName);
                if (action && !activeChild.label.toLowerCase().includes(action.toLowerCase())) {
                    crumbs[crumbs.length - 1] = { label: activeChild.label, href: navigationHref(activeChild) };
                    crumbs.push({ label: action, current: true });
                }
                return crumbs;
            }

            if (isNavigationItemActive(item, routeName)) {
                if (group.label && group.label !== 'Menu') {
                    crumbs.push({ label: group.label });
                }
                crumbs.push({ label: item.label, current: true });
                const action = actionLabel(routeName);
                if (action && !item.label.toLowerCase().includes(action.toLowerCase())) {
                    crumbs[crumbs.length - 1] = { label: item.label, href: navigationHref(item) };
                    crumbs.push({ label: action, current: true });
                }
                return crumbs;
            }
        }
    }

    return [{ ...crumbs[0], current: true, href: undefined }];
}
