import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/Layouts/AdminLayout';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import LibraryLayout from '@/Layouts/LibraryLayout';
import type { PageProps } from '@/types';

interface Account {
    fname: string;
    lname: string;
    email: string;
    avatarUrl: string | null;
}

export default function Edit({ account }: { account: Account }) {
    const { auth } = usePage<PageProps>().props;
    const Layout = auth.activeModule === 'attendance'
        ? AttendanceLayout
        : auth.activeModule === 'library'
            ? LibraryLayout
            : AdminLayout;
    const profile = useForm({
        _method: 'put',
        fname: account.fname,
        lname: account.lname,
        email: account.email,
        profile_picture: null as File | null,
        remove_profile_picture: false,
    });
    const password = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submitProfile(event: FormEvent) {
        event.preventDefault();
        profile.post('/account/profile', { forceFormData: true });
    }

    function submitPassword(event: FormEvent) {
        event.preventDefault();
        password.put('/account/password', { onSuccess: () => password.reset() });
    }

    return (
        <Layout>
            <Head title="My Account" />
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">My Account</h1>
                    <p className="text-muted-foreground">Update your staff profile and password.</p>
                </div>

                <Card>
                    <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Staff identity used throughout JMC.</CardDescription></CardHeader>
                    <CardContent>
                        <form onSubmit={submitProfile} className="space-y-4">
                            {account.avatarUrl && <img src={account.avatarUrl} alt="Profile" className="size-20 rounded-full object-cover" />}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2"><Label htmlFor="fname">First name</Label><Input id="fname" value={profile.data.fname} onChange={(event) => profile.setData('fname', event.target.value)} />{profile.errors.fname && <p className="text-sm text-destructive">{profile.errors.fname}</p>}</div>
                                <div className="space-y-2"><Label htmlFor="lname">Last name</Label><Input id="lname" value={profile.data.lname} onChange={(event) => profile.setData('lname', event.target.value)} />{profile.errors.lname && <p className="text-sm text-destructive">{profile.errors.lname}</p>}</div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={profile.data.email} onChange={(event) => profile.setData('email', event.target.value)} />{profile.errors.email && <p className="text-sm text-destructive">{profile.errors.email}</p>}</div>
                            <div className="space-y-2"><Label htmlFor="profile-picture">Profile picture</Label><Input id="profile-picture" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => profile.setData('profile_picture', event.target.files?.[0] ?? null)} />{profile.errors.profile_picture && <p className="text-sm text-destructive">{profile.errors.profile_picture}</p>}</div>
                            {account.avatarUrl && <div className="flex items-center gap-2"><Checkbox id="remove-picture" checked={profile.data.remove_profile_picture} onCheckedChange={(checked) => profile.setData('remove_profile_picture', checked === true)} /><Label htmlFor="remove-picture">Remove current picture</Label></div>}
                            <Button disabled={profile.processing}>Save profile</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={submitPassword} className="space-y-4">
                            <div className="space-y-2"><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" value={password.data.current_password} onChange={(event) => password.setData('current_password', event.target.value)} />{password.errors.current_password && <p className="text-sm text-destructive">{password.errors.current_password}</p>}</div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" value={password.data.password} onChange={(event) => password.setData('password', event.target.value)} /></div>
                                <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" value={password.data.password_confirmation} onChange={(event) => password.setData('password_confirmation', event.target.value)} /></div>
                            </div>
                            {password.errors.password && <p className="text-sm text-destructive">{password.errors.password}</p>}
                            <Button disabled={password.processing}>Update password</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
