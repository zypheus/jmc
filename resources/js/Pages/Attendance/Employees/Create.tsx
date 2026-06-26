import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps } from '@/types';

export default function Create(_props: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        employee_number: '',
        firstname: '',
        lastname: '',
        department: '',
        position: '',
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
        post('/attendance/employees', { forceFormData: true });
    }

    return (
        <AttendanceLayout>
            <Head title="Add Employee" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <Link href="/attendance/employees" className="text-sm text-primary hover:underline">
                        &larr; Back to employees
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Add Employee</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="employee_id">Employee ID</Label>
                                    <Input
                                        id="employee_id"
                                        value={data.employee_id}
                                        onChange={(e) => setData('employee_id', e.target.value)}
                                    />
                                    {errors.employee_id && (
                                        <p className="text-sm text-destructive">{errors.employee_id}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="employee_number">Employee Number</Label>
                                    <Input
                                        id="employee_number"
                                        value={data.employee_number}
                                        onChange={(e) => setData('employee_number', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstname">First Name</Label>
                                    <Input
                                        id="firstname"
                                        value={data.firstname}
                                        onChange={(e) => setData('firstname', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastname">Last Name</Label>
                                    <Input
                                        id="lastname"
                                        value={data.lastname}
                                        onChange={(e) => setData('lastname', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position</Label>
                                    <Input
                                        id="position"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">Birth Date</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sex">Sex</Label>
                                    <Input
                                        id="sex"
                                        value={data.sex}
                                        onChange={(e) => setData('sex', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="blood_type">Blood Type</Label>
                                    <Input
                                        id="blood_type"
                                        value={data.blood_type}
                                        onChange={(e) => setData('blood_type', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_name">Emergency Contact</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        value={data.emergency_contact_name}
                                        onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_number">Emergency Number</Label>
                                    <Input
                                        id="emergency_contact_number"
                                        value={data.emergency_contact_number}
                                        onChange={(e) => setData('emergency_contact_number', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="formal_picture">Formal Picture</Label>
                                <Input
                                    id="formal_picture"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={(e) => setData('formal_picture', e.target.files?.[0] ?? null)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Create Employee
                                </Button>
                                <Link href="/attendance/employees">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
