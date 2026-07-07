import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps, Paginated } from '@/types';

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
    course: string | null;
    year: string | null;
    qrcode: string | null;
    mobile_number: string | null;
}

interface IndexProps extends PageProps {
    students: Paginated<AttendanceStudent>;
    programs: AttendanceProgram[];
    filters: {
        search?: string;
        course?: string;
        year?: string;
        program_id?: string;
    };
}

function Pagination({ links }: { links: Paginated<unknown>['links'] }) {
    return (
        <div className="mt-4 flex flex-wrap gap-1">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        className={`rounded border px-3 py-1 text-sm ${
                            link.active ? 'border-primary bg-primary text-primary-foreground' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={index}
                        className="px-3 py-1 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}

export default function Index({ students, programs, filters }: IndexProps) {
    const { flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [course, setCourse] = useState(filters.course ?? '');
    const [year, setYear] = useState(filters.year ?? '');
    const [programId, setProgramId] = useState(filters.program_id ?? '');

    function applyFilters(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/attendance/students',
            {
                search: search || undefined,
                course: course || undefined,
                year: year || undefined,
                program_id: programId || undefined,
            },
            { preserveState: true },
        );
    }

    function destroyStudent(id: number) {
        if (confirm('Delete this student?')) {
            router.delete(`/attendance/students/${id}`);
        }
    }

    return (
        <AttendanceLayout>
            <Head title="Attendance Students" />

            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Students</h1>
                        <p className="text-muted-foreground">Manage attendance student records.</p>
                    </div>
                    <Link href="/attendance/students/create" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto">Add Student</Button>
                    </Link>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course">Course</Label>
                                <Input id="course" value={course} onChange={(e) => setCourse(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="program_id">Program</Label>
                                <select
                                    id="program_id"
                                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                                    value={programId}
                                    onChange={(e) => setProgramId(e.target.value)}
                                >
                                    <option value="">All programs</option>
                                    {programs.map((program) => (
                                        <option key={program.id} value={program.program_code}>
                                            {program.program_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-4">
                                <Button type="submit">Apply Filters</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{students.total} student{students.total === 1 ? '' : 's'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-2 font-medium">Name</th>
                                        <th className="pb-2 font-medium">Student ID</th>
                                        <th className="pb-2 font-medium">Course</th>
                                        <th className="pb-2 font-medium">Year</th>
                                        <th className="pb-2 font-medium">QR Code</th>
                                        <th className="pb-2 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.data.map((student) => (
                                        <tr key={student.id} className="border-b last:border-0">
                                            <td className="py-3">
                                                {student.firstname} {student.lastname}
                                            </td>
                                            <td className="py-3">{student.student_id}</td>
                                            <td className="py-3">{student.course ?? '—'}</td>
                                            <td className="py-3">{student.year ?? '—'}</td>
                                            <td className="py-3 font-mono text-xs">{student.qrcode ?? '—'}</td>
                                            <td className="py-3 text-right">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Link href={`/attendance/students/${student.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => destroyStudent(student.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={students.links} />
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
