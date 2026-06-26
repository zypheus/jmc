import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';

export default function AttendanceEmployee() {
    const { data, setData, post, processing, errors } = useForm({
        firstname: '',
        lastname: '',
        department: '',
        position: '',
        employee_id: '',
        birth_date: '',
        sex: '',
        civil_status: '',
        blood_type: '',
        tin_id_number: '',
        philhealth_number: '',
        sss_number: '',
        hdmf_number: '',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_number: '',
        address: '',
        formal_picture: null as File | null,
        employee_signature: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/register/attendance/employee', { forceFormData: true });
    }

    return (
        <GuestLayout>
            <Head title="Attendance Employee Registration" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <Link href="/register" className="text-sm text-primary hover:underline">
                        &larr; Back to registration choice
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Attendance Employee Registration</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee Information</CardTitle>
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
                                    <Label htmlFor="employee_id">Employee ID</Label>
                                    <Input id="employee_id" value={data.employee_id} onChange={(e) => setData('employee_id', e.target.value)} required />
                                    {errors.employee_id && <p className="text-sm text-destructive">{errors.employee_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input id="department" value={data.department} onChange={(e) => setData('department', e.target.value)} required />
                                    {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">Position</Label>
                                <Input id="position" value={data.position} onChange={(e) => setData('position', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="formal_picture">Formal Picture</Label>
                                <Input
                                    id="formal_picture"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('formal_picture', e.target.files?.[0] ?? null)}
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
