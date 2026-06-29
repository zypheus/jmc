import { Head, Link, router } from '@inertiajs/react';
import { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    return role.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function StaffLayout({ actingRole, children }: { actingRole: string; children: ReactNode }) {
    if (actingRole === 'super_admin') return <AdminLayout>{children}</AdminLayout>;
    if (actingRole === 'library_admin') return <LibraryLayout>{children}</LibraryLayout>;
    return <AttendanceLayout>{children}</AttendanceLayout>;
}

export default function Index({ users, manageableRoles, actingRole, auth }: IndexProps) {
    function toggleStatus(user: StaffUser) {
        router.patch(
            `/staff-users/${user.id}/status`,
            { is_active: !user.isActive },
            { preserveScroll: true },
        );
    }

    return (
        <StaffLayout actingRole={actingRole}>
            <Head title="Staff Users" />

            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Staff Users</h1>
                        <p className="text-muted-foreground">
                            Manage {manageableRoles.map(roleLabel).join(', ')} accounts.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/staff-users/create">Add Staff User</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{users.total} staff user{users.total === 1 ? '' : 's'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.fullName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.roles.map(roleLabel).join(', ')}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/staff-users/${user.id}/edit`}>Edit</Link>
                                                </Button>
                                                <Button
                                                    variant={user.isActive ? 'destructive' : 'secondary'}
                                                    size="sm"
                                                    disabled={user.id === auth.user?.id && user.isActive}
                                                    onClick={() => toggleStatus(user)}
                                                >
                                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </StaffLayout>
    );
}
