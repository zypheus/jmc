import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/Layouts/AdminLayout';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps, StaffUser } from '@/types';

interface EditProps extends PageProps {
    staffUser: StaffUser;
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

export default function Edit({ staffUser, manageableRoles, actingRole }: EditProps) {
    const editableRoles = actingRole === 'super_admin'
        ? staffUser.roles
        : staffUser.roles.filter((role) => manageableRoles.includes(role));
    const { data, setData, put, processing, errors } = useForm({
        fname: staffUser.fname,
        lname: staffUser.lname,
        email: staffUser.email,
        password: '',
        roles: editableRoles,
        is_active: staffUser.isActive,
    });

    function toggleRole(role: string, checked: boolean) {
        if (!checked) {
            setData('roles', data.roles.filter((currentRole) => currentRole !== role));
            return;
        }

        setData('roles', role === 'super_admin'
            ? ['super_admin']
            : [...data.roles.filter((currentRole) => currentRole !== 'super_admin'), role]);
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        put(`/staff-users/${staffUser.id}`);
    }

    return (
        <StaffLayout actingRole={actingRole}>
            <Head title="Edit Staff User" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Staff User</h1>
                    <p className="text-muted-foreground">Update {staffUser.fullName}&apos;s account and access.</p>
                </div>

                <Card>
                    <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fname">First Name</Label>
                                    <Input id="fname" value={data.fname} onChange={(event) => setData('fname', event.target.value)} required />
                                    {errors.fname && <p className="text-sm text-destructive">{errors.fname}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lname">Last Name</Label>
                                    <Input id="lname" value={data.lname} onChange={(event) => setData('lname', event.target.value)} required />
                                    {errors.lname && <p className="text-sm text-destructive">{errors.lname}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} required />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input id="password" type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} placeholder="Leave blank to keep the current password" />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <fieldset className="space-y-3 rounded-lg border p-4">
                                <legend className="px-1 text-sm font-medium">Roles</legend>
                                {manageableRoles.map((role) => (
                                    <div key={role} className="flex items-center gap-3">
                                        <Checkbox id={`role-${role}`} checked={data.roles.includes(role)} onCheckedChange={(checked) => toggleRole(role, checked === true)} />
                                        <Label htmlFor={`role-${role}`}>{roleLabel(role)}</Label>
                                    </div>
                                ))}
                                {errors.roles && <p className="text-sm text-destructive">{errors.roles}</p>}
                            </fieldset>

                            <div className="flex items-start gap-3 rounded-lg border p-4">
                                <Checkbox id="is-active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked === true)} />
                                <div>
                                    <Label htmlFor="is-active">Active account</Label>
                                    <p className="text-xs text-muted-foreground">Inactive users are signed out on their next request.</p>
                                </div>
                            </div>
                            {errors.is_active && <p className="text-sm text-destructive">{errors.is_active}</p>}

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button type="submit" disabled={processing}>Save Changes</Button>
                                <Button asChild type="button" variant="outline"><Link href="/staff-users">Cancel</Link></Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </StaffLayout>
    );
}
