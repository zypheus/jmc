import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import FlashAlerts from '@/components/FlashAlerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import type { PageProps } from '@/types';

export default function AttendanceStudent() {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        firstname: '',
        lastname: '',
        middle_initial: '',
        student_id: '',
        mobile_number: '',
        course: '',
        year: '',
        birth_date: '',
        blood_type: '',
        emergency_person: '',
        emergency_relationship: '',
        emergency_number: '',
        emergency_address: '',
        address: '',
        profile_picture: null as File | null,
        student_signature: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/register/attendance', {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <GuestLayout>
            <Head title="Attendance Student Registration" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <Link href="/register" className="text-sm text-primary hover:underline">
                        &larr; Back to registration choice
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Attendance Student Registration</h1>
                </div>

                <FlashAlerts flash={flash} />

                <Card>
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstname">First Name</Label>
                                    <Input id="firstname" value={data.firstname} onChange={(e) => setData('firstname', e.target.value)} required />
                                    {errors.firstname && <p className="text-sm text-destructive">{errors.firstname}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastname">Last Name</Label>
                                    <Input id="lastname" value={data.lastname} onChange={(e) => setData('lastname', e.target.value)} required />
                                    {errors.lastname && <p className="text-sm text-destructive">{errors.lastname}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course</Label>
                                    <Input id="course" value={data.course} onChange={(e) => setData('course', e.target.value)} required />
                                    {errors.course && <p className="text-sm text-destructive">{errors.course}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input id="year" value={data.year} onChange={(e) => setData('year', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mobile_number">Mobile Number</Label>
                                <Input id="mobile_number" value={data.mobile_number} onChange={(e) => setData('mobile_number', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profile_picture">Profile Picture</Label>
                                <Input
                                    id="profile_picture"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('profile_picture', e.target.files?.[0] ?? null)}
                                />
                            </div>

                            <Button type="submit" disabled={processing}>
                                Submit Registration
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
