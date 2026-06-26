import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/Layouts/AdminLayout';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface CreateProps extends PageProps {
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

export default function Create({ manageableRoles, actingRole }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        fname: '',
        lname: '',
        email: '',
        password: '',
        role: manageableRoles[0] ?? '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/staff-users');
    }

    return (
        <StaffLayout actingRole={actingRole}>
            <Head title="Create Staff User" />

            <div className="mx-auto max-w-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Create Staff User</h1>
                    <p className="text-muted-foreground">Add a new staff account.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fname">First Name</Label>
                                    <Input
                                        id="fname"
                                        value={data.fname}
                                        onChange={(e) => setData('fname', e.target.value)}
                                        required
                                    />
                                    {errors.fname && <p className="text-sm text-destructive">{errors.fname}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lname">Last Name</Label>
                                    <Input
                                        id="lname"
                                        value={data.lname}
                                        onChange={(e) => setData('lname', e.target.value)}
                                        required
                                    />
                                    {errors.lname && <p className="text-sm text-destructive">{errors.lname}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                >
                                    {manageableRoles.map((role) => (
                                        <option key={role} value={role}>
                                            {roleLabel(role)}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Create User
                                </Button>
                                <Link href="/staff-users">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </StaffLayout>
    );
}
