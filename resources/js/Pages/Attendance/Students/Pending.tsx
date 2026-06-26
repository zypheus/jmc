import { Head, Link, router, usePage } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AttendanceLayout from '@/Layouts/AttendanceLayout';
import type { PageProps } from '@/types';

interface PendingStudent {
    id: number;
    firstname: string;
    lastname: string;
    course: string | null;
    year: string | null;
    student_id: string | null;
    mobile_number: string | null;
}

interface PendingProps extends PageProps {
    pendingStudents: PendingStudent[];
}

export default function Pending({ pendingStudents }: PendingProps) {
    const { flash } = usePage<PageProps>().props;

    function approve(id: number) {
        if (confirm('Approve this student registration?')) {
            router.post(`/attendance/pending/students/${id}/approve`);
        }
    }

    function reject(id: number) {
        if (confirm('Reject this student registration?')) {
            router.post(`/attendance/pending/students/${id}/reject`);
        }
    }

    return (
        <AttendanceLayout>
            <Head title="Pending Students" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Pending Students</h1>
                        <p className="text-muted-foreground">Approve or reject student registration requests.</p>
                    </div>
                    <Link href="/attendance/pending">
                        <Button variant="outline">All Pending</Button>
                    </Link>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{pendingStudents.length} pending request{pendingStudents.length === 1 ? '' : 's'}</CardTitle>
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
                                        <th className="pb-2 font-medium">Mobile</th>
                                        <th className="pb-2 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingStudents.map((student) => (
                                        <tr key={student.id} className="border-b last:border-0">
                                            <td className="py-3">
                                                {student.firstname} {student.lastname}
                                            </td>
                                            <td className="py-3">{student.student_id ?? '—'}</td>
                                            <td className="py-3">{student.course ?? '—'}</td>
                                            <td className="py-3">{student.year ?? '—'}</td>
                                            <td className="py-3">{student.mobile_number ?? '—'}</td>
                                            <td className="py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={() => approve(student.id)}>
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => reject(student.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AttendanceLayout>
    );
}
