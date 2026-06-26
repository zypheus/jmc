import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import type { PageProps } from '@/types';

interface LibraryProgram {
    id: number;
    program_name: string;
    program_code: string;
}

interface Props extends PageProps {
    libraryPrograms: LibraryProgram[];
    libraryRoles: Array<{ id: number; role_name: string }>;
    workStartYears: number[];
}

export default function LibraryStudent({ libraryPrograms }: Props) {
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
        post('/register/library', { forceFormData: true });
    }

    return (
        <GuestLayout>
            <Head title="Library Student Registration" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <Link href="/register" className="text-sm text-primary hover:underline">
                        &larr; Back to registration choice
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Library Student Registration</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="id_number">ID Number</Label>
                                <Input id="id_number" value={data.id_number} onChange={(e) => setData('id_number', e.target.value)} required />
                                {errors.id_number && <p className="text-sm text-destructive">{errors.id_number}</p>}
                            </div>

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
                                    <Label htmlFor="course">Course / Program</Label>
                                    <select
                                        id="course"
                                        className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                        value={data.course}
                                        onChange={(e) => setData('course', e.target.value)}
                                        required
                                    >
                                        <option value="">Select program</option>
                                        {libraryPrograms.map((program) => (
                                            <option key={program.id} value={program.program_code}>
                                                {program.program_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.course && <p className="text-sm text-destructive">{errors.course}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input id="year" value={data.year} onChange={(e) => setData('year', e.target.value)} required />
                                    {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
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
