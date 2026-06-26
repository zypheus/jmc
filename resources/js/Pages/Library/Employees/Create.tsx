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
    workStartYears: number[];
}

export default function Create({ libraryPrograms, workStartYears }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        firstname: '',
        lastname: '',
        middle_initial: '',
        designation: '',
        program: '',
        year_start_work: '',
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
        post('/employees', { forceFormData: true });
    }

    return (
        <LibraryLayout>
            <Head title="Add Library Employee" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <Link href="/employees" className="text-sm text-primary hover:underline">
                        &larr; Back to employees
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">Register Employee Patron</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="employee_id">Employee ID</Label>
                                    <Input
                                        id="employee_id"
                                        value={data.employee_id}
                                        onChange={(event) => setData('employee_id', event.target.value)}
                                        required
                                    />
                                    {errors.employee_id && (
                                        <p className="text-sm text-destructive">{errors.employee_id}</p>
                                    )}
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
                                    <Label htmlFor="designation">Designation</Label>
                                    <Input
                                        id="designation"
                                        value={data.designation}
                                        onChange={(event) => setData('designation', event.target.value)}
                                        required
                                    />
                                    {errors.designation && (
                                        <p className="text-sm text-destructive">{errors.designation}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="program">Program</Label>
                                    <Select value={data.program} onValueChange={(value) => setData('program', value)}>
                                        <SelectTrigger id="program">
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
                                    {errors.program && <p className="text-sm text-destructive">{errors.program}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year_start_work">Year Start Work</Label>
                                    <Select
                                        value={data.year_start_work}
                                        onValueChange={(value) => setData('year_start_work', value)}
                                    >
                                        <SelectTrigger id="year_start_work">
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workStartYears.map((year) => (
                                                <SelectItem key={year} value={String(year)}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.year_start_work && (
                                        <p className="text-sm text-destructive">{errors.year_start_work}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birth_date">Birth Date</Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(event) => setData('birth_date', event.target.value)}
                                />
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
                                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        value={data.emergency_contact_name}
                                        onChange={(event) => setData('emergency_contact_name', event.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_relationship">Emergency Relationship</Label>
                                    <Input
                                        id="emergency_contact_relationship"
                                        value={data.emergency_contact_relationship}
                                        onChange={(event) =>
                                            setData('emergency_contact_relationship', event.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
                                    <Input
                                        id="emergency_contact_number"
                                        value={data.emergency_contact_number}
                                        onChange={(event) => setData('emergency_contact_number', event.target.value)}
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
                                <Label htmlFor="formal_picture">Formal Picture</Label>
                                <Input
                                    id="formal_picture"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={(event) => setData('formal_picture', event.target.files?.[0] ?? null)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employee_signature">Employee Signature (optional)</Label>
                                <Textarea
                                    id="employee_signature"
                                    value={data.employee_signature}
                                    onChange={(event) => setData('employee_signature', event.target.value)}
                                    rows={3}
                                    placeholder="Optional base64 signature data"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Create Employee
                                </Button>
                                <Link href="/employees">
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
