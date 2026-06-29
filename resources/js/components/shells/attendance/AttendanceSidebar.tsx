import { Link } from '@inertiajs/react';

import FlatNavMenu from '@/components/shells/FlatNavMenu';
import { dashboardRouteFor } from '@/config/modules';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import type { NavigationGroup } from '@/types/navigation';

interface AttendanceSidebarProps {
    navigation: NavigationGroup[];
    routeName?: string | null;
    auth: PageProps['auth'];
    collapsed: boolean;
    onLogout: () => void;
    onNavigate?: () => void;
}

export default function AttendanceSidebar({
    navigation,
    routeName,
    auth,
    collapsed,
    onLogout,
    onNavigate,
}: AttendanceSidebarProps) {
    const items = navigation[0]?.items ?? [];
    const dashboardHref = route(dashboardRouteFor('attendance', auth));

    return (
        <aside className={cn('attendance-sidebar', collapsed && 'is-collapsed')}>
            <div className="attendance-sidebar-header">
                <Link href={dashboardHref} className="attendance-sidebar-brand" onClick={onNavigate} title="JMC Attendance">
                    <img src="/images/d.png" alt="JMC" className="attendance-sidebar-logo" />
                </Link>
            </div>

            <div className="attendance-sidebar-body">
                <nav id="routeWrapper" className="attendance-sidebar-nav" aria-label="Attendance navigation">
                    <FlatNavMenu
                        items={items}
                        routeName={routeName}
                        variant="attendance"
                        collapsed={collapsed}
                        onNavigate={onNavigate}
                    />
                </nav>
            </div>

            <div className="attendance-sidebar-footer">
                <div className="attendance-sidebar-footer-meta">
                    <span className="attendance-sidebar-footer-dot" aria-hidden="true" />
                    {!collapsed && <span className="attendance-sidebar-footer-label">JMC Attendance</span>}
                </div>
                <button
                    type="button"
                    className="attendance-sidebar-logout"
                    title="Logout"
                    onClick={onLogout}
                >
                    <span className="sidebar-link__main">
                        <i className="bi bi-box-arrow-right sidebar-link__icon" aria-hidden="true" />
                        {!collapsed && <span className="sidebar-link__label">Logout</span>}
                    </span>
                </button>
            </div>
        </aside>
    );
}
