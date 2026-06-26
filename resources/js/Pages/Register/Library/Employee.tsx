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

export default function LibraryEmployee({ libraryPrograms, workStartYears }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        firstname: '',
        lastname: '',
        middle_initial: '',
        employee_id: '',
        designation: '',
        program: '',
        year_start_work: String(workStartYears[0] ?? new Date().getFullYear()),
        birth_date: '',
        mobile_number: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_number: '',
        emergency_address: '',
        formal_picture: null as File | null,
        employee_signature: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/register/library/employee', { forceFormData: true });
    }

    return (
        <GuestLayout>
            <Head title="Library Employee Registration" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <Link href="/register" className="text-sm text-primary hover:underline">
                        &larr; Back to registration choice
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Library Employee Registration</h1>
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
                                    <Label htmlFor="designation">Designation</Label>
                                    <Input id="designation" value={data.designation} onChange={(e) => setData('designation', e.target.value)} required />
                                    {errors.designation && <p className="text-sm text-destructive">{errors.designation}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="program">Program</Label>
                                    <select
                                        id="program"
                                        className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                        value={data.program}
                                        onChange={(e) => setData('program', e.target.value)}
                                        required
                                    >
                                        <option value="">Select program</option>
                                        {libraryPrograms.map((program) => (
                                            <option key={program.id} value={program.program_code}>
                                                {program.program_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.program && <p className="text-sm text-destructive">{errors.program}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year_start_work">Year Started Work</Label>
                                    <select
                                        id="year_start_work"
                                        className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                        value={data.year_start_work}
                                        onChange={(e) => setData('year_start_work', e.target.value)}
                                        required
                                    >
                                        {workStartYears.map((year) => (
                                            <option key={year} value={String(year)}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
