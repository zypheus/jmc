import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps } from '@/types';

interface AttendanceProgram {
    id: number;
    program_code: string;
    program_name: string;
}

interface AttendanceStudent {
    id: number;
    student_id: string;
    firstname: string;
    lastname: string;
    middle_initial: string | null;
    birth_date: string | null;
    course: string | null;
    year: string | null;
    mobile_number: string | null;
    address: string | null;
    emergency_person: string | null;
    emergency_relationship: string | null;
    emergency_number: string | null;
    emergency_address: string | null;
    profile_picture: string | null;
    qrcode: string | null;
}

interface EditProps extends PageProps {
    student: AttendanceStudent;
    programs: AttendanceProgram[];
}

function formatDate(value: string | null): string {
    if (!value) {
        return '';
    }
    return value.slice(0, 10);
}

export default function Edit({ student, programs }: EditProps) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        student_id: student.student_id,
        firstname: student.firstname,
        lastname: student.lastname,
        middle_initial: student.middle_initial ?? '',
        birth_date: formatDate(student.birth_date),
        course: student.course ?? '',
        year: student.year ?? '',
        mobile_number: student.mobile_number ?? '',
        address: student.address ?? '',
        emergency_person: student.emergency_person ?? '',
        emergency_relationship: student.emergency_relationship ?? '',
        emergency_number: student.emergency_number ?? '',
        emergency_address: student.emergency_address ?? '',
        profile_picture: null as File | null,
        student_signature: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post(`/attendance/students/${student.id}`, { forceFormData: true });
    }

    return (
        <AttendanceLayout>
            <Head title={`Edit ${student.firstname} ${student.lastname}`} />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <Link href="/attendance/students" className="text-sm text-primary hover:underline">
                        &larr; Back to students
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Edit Student</h1>
                    {student.qrcode && (
                        <p className="text-sm text-muted-foreground">QR Code: {student.qrcode}</p>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="student_id">Student ID</Label>
                                    <Input
                                        id="student_id"
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        required
                                    />
                                    {errors.student_id && (
                                        <p className="text-sm text-destructive">{errors.student_id}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile_number">Mobile Number</Label>
                                    <Input
                                        id="mobile_number"
                                        value={data.mobile_number}
                                        onChange={(e) => setData('mobile_number', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="firstname">First Name</Label>
                                    <Input
                                        id="firstname"
                                        value={data.firstname}
                                        onChange={(e) => setData('firstname', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastname">Last Name</Label>
                                    <Input
                                        id="lastname"
                                        value={data.lastname}
                                        onChange={(e) => setData('lastname', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middle_initial">Middle Initial</Label>
                                    <Input
                                        id="middle_initial"
                                        value={data.middle_initial}
                                        onChange={(e) => setData('middle_initial', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course</Label>
                                    <Input
                                        id="course"
                                        list="program-list"
                                        value={data.course}
                                        onChange={(e) => setData('course', e.target.value)}
                                    />
                                    <datalist id="program-list">
                                        {programs.map((program) => (
                                            <option key={program.id} value={program.program_code}>
                                                {program.program_name}
                                            </option>
                                        ))}
                                    </datalist>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input
                                        id="year"
                                        value={data.year}
                                        onChange={(e) => setData('year', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">Birth Date</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
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
                                    <Label htmlFor="emergency_person">Emergency Contact</Label>
                                    <Input
                                        id="emergency_person"
                                        value={data.emergency_person}
                                        onChange={(e) => setData('emergency_person', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_relationship">Relationship</Label>
                                    <Input
                                        id="emergency_relationship"
                                        value={data.emergency_relationship}
                                        onChange={(e) => setData('emergency_relationship', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_number">Emergency Number</Label>
                                    <Input
                                        id="emergency_number"
                                        value={data.emergency_number}
                                        onChange={(e) => setData('emergency_number', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_address">Emergency Address</Label>
                                    <Input
                                        id="emergency_address"
                                        value={data.emergency_address}
                                        onChange={(e) => setData('emergency_address', e.target.value)}
                                    />
                                </div>
                            </div>

                            {student.profile_picture && (
                                <img
                                    src={`/${student.profile_picture.replace(/^\//, '')}`}
                                    alt="Current profile"
                                    className="h-24 w-24 rounded object-cover"
                                />
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="profile_picture">Replace Profile Picture</Label>
                                <Input
                                    id="profile_picture"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={(e) => setData('profile_picture', e.target.files?.[0] ?? null)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Save Changes
                                </Button>
                                <Link href="/attendance/students">
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
