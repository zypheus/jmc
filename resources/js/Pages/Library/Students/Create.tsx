import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import LibraryLayout from '@/Layouts/LibraryLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PageProps } from '@/types';

interface LibraryProgram {
    id: number;
    program_code: string;
    program_name: string;
}

interface CreateProps extends PageProps {
    libraryPrograms: LibraryProgram[];
}

export default function Create({ libraryPrograms }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        id_number: '',
        firstname: '',
        lastname: '',
        middle_initial: '',
        birthday: '',
        course: '',
        year: '',
        mobile_number: '',
        email: '',
        address: '',
        emergency_person: '',
        emergency_relationship: '',
        emergency_number: '',
        emergency_address: '',
        profile_picture: null as File | null,
        student_signature: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/students', { forceFormData: true });
    }

    return (
        <LibraryLayout>
            <Head title="Add Library Student" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <Link href="/students" className="text-sm text-primary hover:underline">
                        &larr; Back to students
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Register Student Patron</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="id_number">ID Number</Label>
                                    <Input
                                        id="id_number"
                                        value={data.id_number}
                                        onChange={(event) => setData('id_number', event.target.value)}
                                        required
                                    />
                                    {errors.id_number && <p className="text-sm text-destructive">{errors.id_number}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile_number">Mobile Number</Label>
                                    <Input
                                        id="mobile_number"
                                        value={data.mobile_number}
                                        onChange={(event) => setData('mobile_number', event.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="firstname">First Name</Label>
                                    <Input
                                        id="firstname"
                                        value={data.firstname}
                                        onChange={(event) => setData('firstname', event.target.value)}
                                        required
                                    />
                                    {errors.firstname && <p className="text-sm text-destructive">{errors.firstname}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastname">Last Name</Label>
                                    <Input
                                        id="lastname"
                                        value={data.lastname}
                                        onChange={(event) => setData('lastname', event.target.value)}
                                        required
                                    />
                                    {errors.lastname && <p className="text-sm text-destructive">{errors.lastname}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middle_initial">Middle Initial</Label>
                                    <Input
                                        id="middle_initial"
                                        value={data.middle_initial}
                                        onChange={(event) => setData('middle_initial', event.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Program</Label>
                                    <Select value={data.course} onValueChange={(value) => setData('course', value)}>
                                        <SelectTrigger id="course">
                                            <SelectValue placeholder="Select program" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {libraryPrograms.map((program) => (
                                                <SelectItem key={program.id} value={program.program_code}>
                                                    {program.program_code} - {program.program_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.course && <p className="text-sm text-destructive">{errors.course}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year Level</Label>
                                    <Input
                                        id="year"
                                        value={data.year}
                                        onChange={(event) => setData('year', event.target.value)}
                                        placeholder="e.g. 1st Year"
                                        required
                                    />
                                    {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birthday">Birthday</Label>
                                    <Input
                                        id="birthday"
                                        type="date"
                                        value={data.birthday}
                                        onChange={(event) => setData('birthday', event.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(event) => setData('address', event.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_person">Emergency Contact Person</Label>
                                    <Input
                                        id="emergency_person"
                                        value={data.emergency_person}
                                        onChange={(event) => setData('emergency_person', event.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_relationship">Emergency Relationship</Label>
                                    <Input
                                        id="emergency_relationship"
                                        value={data.emergency_relationship}
                                        onChange={(event) => setData('emergency_relationship', event.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_number">Emergency Number</Label>
                                    <Input
                                        id="emergency_number"
                                        value={data.emergency_number}
                                        onChange={(event) => setData('emergency_number', event.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_address">Emergency Address</Label>
                                    <Textarea
                                        id="emergency_address"
                                        value={data.emergency_address}
                                        onChange={(event) => setData('emergency_address', event.target.value)}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profile_picture">Profile Picture</Label>
                                <Input
                                    id="profile_picture"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={(event) => setData('profile_picture', event.target.files?.[0] ?? null)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="student_signature">Student Signature (optional)</Label>
                                <Textarea
                                    id="student_signature"
                                    value={data.student_signature}
                                    onChange={(event) => setData('student_signature', event.target.value)}
                                    placeholder="Optional base64 signature data"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Create Student
                                </Button>
                                <Link href="/students">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </LibraryLayout>
    );
}
