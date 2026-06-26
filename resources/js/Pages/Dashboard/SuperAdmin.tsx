import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';

export default function SuperAdmin() {
    return (
        <AdminLayout>
            <Head title="Super Admin Dashboard" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        System-wide administration for library and attendance staff.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Staff Users</CardTitle>
                            <CardDescription>
                                Manage library and attendance admins and staff across both modules.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/staff-users">
                                <Button className="w-full">Manage All Staff</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Library Admin</CardTitle>
                            <CardDescription>Library module administration.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/library-admin">
                                <Button variant="outline" className="w-full">
                                    Library Dashboard
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Admin</CardTitle>
                            <CardDescription>Attendance module administration.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/attendance-admin">
                                <Button variant="outline" className="w-full">
                                    Attendance Dashboard
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
