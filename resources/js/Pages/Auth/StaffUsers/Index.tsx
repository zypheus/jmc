import { Head, Link, router } from '@inertiajs/react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, Paginated, StaffUser } from '@/types';

interface IndexProps extends PageProps {
    users: Paginated<StaffUser>;
    manageableRoles: string[];
    actingRole: string;
}

function roleLabel(role: string): string {
    return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function StaffLayout({ actingRole, children }: { actingRole: string; children: ReactNode }) {
    if (actingRole === 'super_admin') {
        return <AdminLayout>{children}</AdminLayout>;
    }

    if (actingRole === 'library_admin') {
        return <LibraryLayout>{children}</LibraryLayout>;
    }

    return <AttendanceLayout>{children}</AttendanceLayout>;
}

export default function Index({ users, manageableRoles, actingRole }: IndexProps) {
    function destroyUser(id: number) {
        if (confirm('Delete this staff user?')) {
            router.delete(`/staff-users/${id}`);
        }
    }

    return (
        <StaffLayout actingRole={actingRole}>
            <Head title="Staff Users" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Staff Users</h1>
                        <p className="text-muted-foreground">
                            Manage {manageableRoles.map(roleLabel).join(', ')} accounts.
                        </p>
                    </div>
                    <Link href="/staff-users/create">
                        <Button>Add Staff User</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{users.total} staff user{users.total === 1 ? '' : 's'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-2 font-medium">Name</th>
                                        <th className="pb-2 font-medium">Email</th>
                                        <th className="pb-2 font-medium">Role</th>
                                        <th className="pb-2 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="border-b last:border-0">
                                            <td className="py-3">{user.fullName}</td>
                                            <td className="py-3">{user.email}</td>
                                            <td className="py-3">{user.roles.map(roleLabel).join(', ')}</td>
                                            <td className="py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/staff-users/${user.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => destroyUser(user.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StaffLayout>
    );
}
