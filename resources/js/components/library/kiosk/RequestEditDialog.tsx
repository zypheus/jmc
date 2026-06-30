import { FormEvent, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PageProps } from '@/types';
import {
    YEAR_LEVELS,
    type KioskEmployeePatron,
    type KioskStudentPatron,
    type LibraryProgramOption,
} from '@/types/libraryKiosk';

interface StudentEditProps {
    patronType: 'student';
    patron: KioskStudentPatron;
    programs: LibraryProgramOption[];
    hasPendingEditRequest: boolean;
}

interface EmployeeEditProps {
    patronType: 'employee';
    patron: KioskEmployeePatron;
    programs: LibraryProgramOption[];
    workStartYears: number[];
    hasPendingEditRequest: boolean;
}

type RequestEditDialogProps = StudentEditProps | EmployeeEditProps;

export default function RequestEditDialog(props: RequestEditDialogProps) {
    const { flash } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);

    if (props.patronType === 'student') {
        return (
            <StudentEditForm
                {...props}
                open={open}
                setOpen={setOpen}
                flashSuccess={flash.success}
                flashError={flash.error}
            />
        );
    }

    return (
        <EmployeeEditForm
            {...props}
            open={open}
            setOpen={setOpen}
            flashSuccess={flash.success}
            flashError={flash.error}
        />
    );
}

function StudentEditForm({
    patron,
    programs,
    hasPendingEditRequest,
    open,
    setOpen,
    flashSuccess,
    flashError,
}: StudentEditProps & {
    open: boolean;
    setOpen: (open: boolean) => void;
    flashSuccess?: string | null;
    flashError?: string | null;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: patron.id,
        lastname: patron.lastname,
        firstname: patron.firstname,
        middle_initial: patron.middle_initial ?? '',
        birthday: patron.birthday ?? '',
        program_id: patron.program_id ? String(patron.program_id) : '',
        year: patron.year ?? '',
        mobile_number: patron.mobile_number ?? '',
        email: patron.email ?? '',
        address: patron.address ?? '',
        emergency_person: patron.emergency_person ?? '',
        emergency_relationship: patron.emergency_relationship ?? '',
        emergency_number: patron.emergency_number ?? '',
        emergency_address: patron.emergency_address ?? '',
        profile_picture: null as File | null,
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/students/profile/request', {
            forceFormData: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={hasPendingEditRequest}>
                    {hasPendingEditRequest ? 'Edit request pending' : 'Request edit'}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Request profile edit</DialogTitle>
                    <DialogDescription>
                        Changes are reviewed by library staff before they appear on your account.
                    </DialogDescription>
                </DialogHeader>
                {(flashSuccess || flashError) && open && (
                    <p className={`text-sm ${flashError ? 'text-destructive' : 'text-green-700'}`}>
                        {flashError ?? flashSuccess}
                    </p>
                )}
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Last name" error={errors.lastname}>
                            <Input value={data.lastname} onChange={(e) => setData('lastname', e.target.value)} />
                        </Field>
                        <Field label="First name" error={errors.firstname}>
                            <Input value={data.firstname} onChange={(e) => setData('firstname', e.target.value)} />
                        </Field>
                        <Field label="Middle initial" error={errors.middle_initial}>
                            <Input
                                value={data.middle_initial}
                                onChange={(e) => setData('middle_initial', e.target.value)}
                                maxLength={1}
                            />
                        </Field>
                    </div>
                    <Field label="Birthday" error={errors.birthday}>
                        <Input
                            type="date"
                            value={data.birthday}
                            onChange={(e) => setData('birthday', e.target.value)}
                        />
                    </Field>
                    <Field label="Program" error={errors.program_id}>
                        <Select
                            value={data.program_id || undefined}
                            onValueChange={(value) => setData('program_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                                {programs.map((program) => (
                                    <SelectItem key={program.id} value={String(program.id)}>
                                        {program.program_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Year level" error={errors.year}>
                        <Select value={data.year || undefined} onValueChange={(value) => setData('year', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                {YEAR_LEVELS.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Mobile number" error={errors.mobile_number}>
                            <Input
                                value={data.mobile_number}
                                onChange={(e) => setData('mobile_number', e.target.value)}
                            />
                        </Field>
                        <Field label="Email" error={errors.email}>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="For reservation alerts"
                            />
                        </Field>
                    </div>
                    <Field label="Address" error={errors.address}>
                        <Textarea value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Emergency person" error={errors.emergency_person}>
                            <Input
                                value={data.emergency_person}
                                onChange={(e) => setData('emergency_person', e.target.value)}
                            />
                        </Field>
                        <Field label="Relationship" error={errors.emergency_relationship}>
                            <Input
                                value={data.emergency_relationship}
                                onChange={(e) => setData('emergency_relationship', e.target.value)}
                            />
                        </Field>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Emergency number" error={errors.emergency_number}>
                            <Input
                                value={data.emergency_number}
                                onChange={(e) => setData('emergency_number', e.target.value)}
                            />
                        </Field>
                        <Field label="Emergency address" error={errors.emergency_address}>
                            <Textarea
                                value={data.emergency_address}
                                onChange={(e) => setData('emergency_address', e.target.value)}
                            />
                        </Field>
                    </div>
                    <Field label="Profile picture" error={errors.profile_picture}>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('profile_picture', e.target.files?.[0] ?? null)}
                        />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => reset()}>
                            Reset
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Submit request
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EmployeeEditForm({
    patron,
    programs,
    workStartYears,
    hasPendingEditRequest,
    open,
    setOpen,
    flashSuccess,
    flashError,
}: EmployeeEditProps & {
    open: boolean;
    setOpen: (open: boolean) => void;
    flashSuccess?: string | null;
    flashError?: string | null;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: patron.id,
        lastname: patron.lastname,
        firstname: patron.firstname,
        middle_initial: patron.middle_initial ?? '',
        employee_id_value: patron.employee_id ?? '',
        designation: patron.designation ?? '',
        program: patron.program ?? '',
        year_start_work: patron.year_start_work ?? String(workStartYears[0] ?? new Date().getFullYear()),
        birth_date: patron.birth_date ?? '',
        mobile_number: patron.mobile_number ?? '',
        address: patron.address ?? '',
        emergency_contact_name: patron.emergency_contact_name ?? '',
        emergency_contact_relationship: patron.emergency_contact_relationship ?? '',
        emergency_contact_number: patron.emergency_contact_number ?? '',
        emergency_address: patron.emergency_address ?? '',
        formal_picture: null as File | null,
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/employees/profile/request', {
            forceFormData: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={hasPendingEditRequest}>
                    {hasPendingEditRequest ? 'Edit request pending' : 'Request edit'}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Request profile edit</DialogTitle>
                    <DialogDescription>
                        Changes are reviewed by library staff before they appear on your account.
                    </DialogDescription>
                </DialogHeader>
                {(flashSuccess || flashError) && open && (
                    <p className={`text-sm ${flashError ? 'text-destructive' : 'text-green-700'}`}>
                        {flashError ?? flashSuccess}
                    </p>
                )}
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Last name" error={errors.lastname}>
                            <Input value={data.lastname} onChange={(e) => setData('lastname', e.target.value)} />
                        </Field>
                        <Field label="First name" error={errors.firstname}>
                            <Input value={data.firstname} onChange={(e) => setData('firstname', e.target.value)} />
                        </Field>
                        <Field label="Middle initial" error={errors.middle_initial}>
                            <Input
                                value={data.middle_initial}
                                onChange={(e) => setData('middle_initial', e.target.value)}
                                maxLength={1}
                            />
                        </Field>
                    </div>
                    <Field label="Employee ID" error={errors.employee_id_value}>
                        <Input
                            value={data.employee_id_value}
                            onChange={(e) => setData('employee_id_value', e.target.value)}
                        />
                    </Field>
                    <Field label="Designation" error={errors.designation}>
                        <Input
                            value={data.designation}
                            onChange={(e) => setData('designation', e.target.value)}
                        />
                    </Field>
                    <Field label="Program" error={errors.program}>
                        <Select value={data.program || undefined} onValueChange={(value) => setData('program', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                                {programs.map((program) => (
                                    <SelectItem key={program.id} value={program.program_code}>
                                        {program.program_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Year started work" error={errors.year_start_work}>
                        <Select
                            value={data.year_start_work}
                            onValueChange={(value) => setData('year_start_work', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {workStartYears.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Birth date" error={errors.birth_date}>
                        <Input
                            type="date"
                            value={data.birth_date}
                            onChange={(e) => setData('birth_date', e.target.value)}
                        />
                    </Field>
                    <Field label="Mobile number" error={errors.mobile_number}>
                        <Input
                            value={data.mobile_number}
                            onChange={(e) => setData('mobile_number', e.target.value)}
                        />
                    </Field>
                    <Field label="Address" error={errors.address}>
                        <Textarea value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Emergency contact" error={errors.emergency_contact_name}>
                            <Input
                                value={data.emergency_contact_name}
                                onChange={(e) => setData('emergency_contact_name', e.target.value)}
                            />
                        </Field>
                        <Field label="Relationship" error={errors.emergency_contact_relationship}>
                            <Input
                                value={data.emergency_contact_relationship}
                                onChange={(e) => setData('emergency_contact_relationship', e.target.value)}
                            />
                        </Field>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Emergency number" error={errors.emergency_contact_number}>
                            <Input
                                value={data.emergency_contact_number}
                                onChange={(e) => setData('emergency_contact_number', e.target.value)}
                            />
                        </Field>
                        <Field label="Emergency address" error={errors.emergency_address}>
                            <Textarea
                                value={data.emergency_address}
                                onChange={(e) => setData('emergency_address', e.target.value)}
                            />
                        </Field>
                    </div>
                    <Field label="Formal picture" error={errors.formal_picture}>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('formal_picture', e.target.files?.[0] ?? null)}
                        />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => reset()}>
                            Reset
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Submit request
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
