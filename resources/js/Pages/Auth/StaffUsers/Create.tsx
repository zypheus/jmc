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
import type { PageProps } from '@/types';

interface CreateProps extends PageProps {
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

export default function Create({ manageableRoles, actingRole }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        fname: '',
        lname: '',
        email: '',
        password: '',
        roles: actingRole === 'super_admin' ? [] as string[] : [manageableRoles[0]].filter(Boolean) as string[],
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
        post('/staff-users');
    }

    return (
        <StaffLayout actingRole={actingRole}>
            <Head title="Create Staff User" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Create Staff User</h1>
                    <p className="text-muted-foreground">Add a staff account and assign its module access.</p>
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
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} required />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <fieldset className="space-y-3 rounded-lg border p-4">
                                <legend className="px-1 text-sm font-medium">Roles</legend>
                                {manageableRoles.map((role) => (
                                    <div key={role} className="flex items-center gap-3">
                                        <Checkbox
                                            id={`role-${role}`}
                                            checked={data.roles.includes(role)}
                                            onCheckedChange={(checked) => toggleRole(role, checked === true)}
                                        />
                                        <Label htmlFor={`role-${role}`}>{roleLabel(role)}</Label>
                                    </div>
                                ))}
                                {errors.roles && <p className="text-sm text-destructive">{errors.roles}</p>}
                            </fieldset>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button type="submit" disabled={processing}>Create User</Button>
                                <Button asChild type="button" variant="outline"><Link href="/staff-users">Cancel</Link></Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </StaffLayout>
    );
}
